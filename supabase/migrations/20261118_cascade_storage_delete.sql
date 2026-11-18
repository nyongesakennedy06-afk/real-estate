-- ==============================================================================
-- Kiragu & Mwangi Real Estate - Storage Cascade Cleanup Triggers
-- Ensures that when a property or property_image is deleted, associated files
-- stored in the Supabase 'property-images' storage bucket are also deleted.
-- ==============================================================================

-- 1. Ensure foreign key on property_images has ON DELETE CASCADE
-- (Already created in initial schema, reiterated here for certainty)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.referential_constraints 
    WHERE constraint_name = 'property_images_property_id_fkey'
      AND delete_rule = 'CASCADE'
  ) THEN
    ALTER TABLE public.property_images 
      DROP CONSTRAINT IF EXISTS property_images_property_id_fkey,
      ADD CONSTRAINT property_images_property_id_fkey 
      FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Trigger function to clean up storage.objects when a property_image is deleted
CREATE OR REPLACE FUNCTION public.delete_storage_object_on_property_image_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  IF OLD.storage_path IS NOT NULL AND OLD.storage_path <> '' THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'property-images' AND name = OLD.storage_path;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_delete_property_image_storage ON public.property_images;
CREATE TRIGGER trg_delete_property_image_storage
AFTER DELETE ON public.property_images
FOR EACH ROW
EXECUTE FUNCTION public.delete_storage_object_on_property_image_delete();

-- 3. Trigger function to clean up any files under <property_id>/ when property is deleted
CREATE OR REPLACE FUNCTION public.delete_property_storage_folder_on_property_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'property-images'
    AND (name LIKE (OLD.id::text || '/%'));
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_delete_property_storage_folder ON public.properties;
CREATE TRIGGER trg_delete_property_storage_folder
AFTER DELETE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.delete_property_storage_folder_on_property_delete();
