-- ==============================================================================
-- Kiragu & Mwangi Real Estate Management System
-- Database Schema, Functions, Triggers, RLS Policies, Storage & Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES

-- 2.1 profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone_number text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2.2 properties
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('residential', 'commercial')),
  listing_type text NOT NULL CHECK (listing_type IN ('sale', 'rent')),
  location text NOT NULL,
  price numeric(15,2) NOT NULL,
  bedrooms int,
  bathrooms int,
  size_sqft numeric(10,2),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'rented')),
  is_featured boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_location_lower ON public.properties(lower(location));
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON public.properties(is_featured);

-- 2.3 property_images
CREATE TABLE IF NOT EXISTS public.property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text,
  is_primary boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_primary ON public.property_images(property_id) WHERE is_primary = true;

-- 2.4 viewing_bookings
CREATE TABLE IF NOT EXISTS public.viewing_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewing_date date NOT NULL,
  viewing_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'closed')),
  client_notes text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_viewing_bookings_property ON public.viewing_bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_viewing_bookings_user ON public.viewing_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_bookings_status ON public.viewing_bookings(status);
-- Guard against double-booking for active slots
CREATE UNIQUE INDEX IF NOT EXISTS idx_viewing_bookings_no_double_booking 
ON public.viewing_bookings(property_id, viewing_date, viewing_time) 
WHERE status IN ('pending', 'confirmed', 'rescheduled');

-- 2.5 valuation_requests
CREATE TABLE IF NOT EXISTS public.valuation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_category text NOT NULL CHECK (property_category IN ('residential', 'commercial')),
  location text NOT NULL,
  lr_number text,
  approximate_size text,
  purpose text NOT NULL CHECK (purpose IN ('sale', 'purchase', 'mortgage', 'insurance', 'rental', 'other')),
  additional_details text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'completed')),
  handled_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_valuation_requests_user ON public.valuation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_valuation_requests_status ON public.valuation_requests(status);

-- 2.6 audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_name text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_name, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);


-- 3. HELPER FUNCTIONS & TRIGGERS

-- 3.1 is_admin() helper function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    ELSE EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    )
  END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO PUBLIC, anon, authenticated;

-- 3.2 updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_viewing_bookings_updated_at
BEFORE UPDATE ON public.viewing_bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_valuation_requests_updated_at
BEFORE UPDATE ON public.valuation_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3.3 Trigger on auth.users -> public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone_number, role, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'phone_number',
    'user', -- Always default to user, ignore client metadata
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3.4 Trigger on profiles update (role protection & lockout prevention)
CREATE OR REPLACE FUNCTION public.handle_profile_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_count int;
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) OR (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    IF NOT public.is_admin() AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Only administrators can modify user roles or active status.';
    END IF;

    -- Lockout rule 1: Admin cannot demote or deactivate themselves
    IF auth.uid() = OLD.id AND (NEW.role <> 'admin' OR NEW.is_active = false) THEN
      RAISE EXCEPTION 'Administrators cannot demote or deactivate their own account.';
    END IF;

    -- Lockout rule 2: Last remaining admin cannot be demoted or deactivated
    IF OLD.role = 'admin' AND (NEW.role <> 'admin' OR NEW.is_active = false) THEN
      SELECT count(*) INTO v_admin_count
      FROM public.profiles
      WHERE role = 'admin' AND is_active = true AND id <> OLD.id;

      IF v_admin_count = 0 THEN
        RAISE EXCEPTION 'Cannot demote or deactivate the last remaining administrator.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_profiles_security_check
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_profile_updates();

REVOKE EXECUTE ON FUNCTION public.handle_profile_updates() FROM PUBLIC, anon, authenticated;

-- 3.5 Viewing booking slot validation trigger
CREATE OR REPLACE FUNCTION public.validate_viewing_booking_slot()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prop_status text;
  v_now_nairobi timestamptz;
  v_today_nairobi date;
  v_time_nairobi time;
BEGIN
  -- Property must be available
  SELECT status INTO v_prop_status FROM public.properties WHERE id = NEW.property_id;
  IF v_prop_status IS DISTINCT FROM 'available' THEN
    RAISE EXCEPTION 'Site viewings can only be scheduled for available properties (current status: %).', COALESCE(v_prop_status, 'unknown');
  END IF;

  -- Timezone calculations (Africa/Nairobi UTC+3)
  v_now_nairobi := now() AT TIME ZONE 'Africa/Nairobi';
  v_today_nairobi := v_now_nairobi::date;
  v_time_nairobi := v_now_nairobi::time;

  -- Date checks: today or later, capped at 60 days
  IF NEW.viewing_date < v_today_nairobi THEN
    RAISE EXCEPTION 'Viewing date cannot be in the past.';
  END IF;

  IF NEW.viewing_date > (v_today_nairobi + 60) THEN
    RAISE EXCEPTION 'Viewing date cannot be more than 60 days in advance.';
  END IF;

  IF NEW.viewing_date = v_today_nairobi AND NEW.viewing_time <= v_time_nairobi THEN
    RAISE EXCEPTION 'Viewing time for today must be in the future.';
  END IF;

  -- Day of week: Monday through Saturday (DOW: 0=Sun, 1=Mon, ..., 6=Sat)
  IF EXTRACT(DOW FROM NEW.viewing_date) = 0 THEN
    RAISE EXCEPTION 'Site viewings are available Monday through Saturday only (office closed Sundays).';
  END IF;

  -- Time between 09:00 and 17:00
  IF NEW.viewing_time < '09:00:00'::time OR NEW.viewing_time > '17:00:00'::time THEN
    RAISE EXCEPTION 'Viewing time must be between 09:00 and 17:00.';
  END IF;

  -- In 30-minute steps
  IF EXTRACT(MINUTE FROM NEW.viewing_time) NOT IN (0, 30) OR EXTRACT(SECOND FROM NEW.viewing_time) <> 0 THEN
    RAISE EXCEPTION 'Viewing time must be scheduled in 30-minute intervals (e.g. 09:00, 09:30).';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_validate_viewing_booking
BEFORE INSERT OR UPDATE OF viewing_date, viewing_time, property_id ON public.viewing_bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_viewing_booking_slot();

REVOKE EXECUTE ON FUNCTION public.validate_viewing_booking_slot() FROM PUBLIC, anon, authenticated;

-- 3.6 Generic audit log trigger
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entity_id uuid;
  v_details jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_entity_id := NEW.id;
    v_details := jsonb_build_object('new', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    v_entity_id := NEW.id;
    v_details := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
    v_details := jsonb_build_object('old', to_jsonb(OLD));
  END IF;

  INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, details)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, v_entity_id, v_details);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Audit log failed: %', SQLERRM;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_audit_properties
AFTER INSERT OR UPDATE OR DELETE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE OR REPLACE TRIGGER trg_audit_property_images
AFTER INSERT OR UPDATE OR DELETE ON public.property_images
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE OR REPLACE TRIGGER trg_audit_viewing_bookings
AFTER INSERT OR UPDATE OR DELETE ON public.viewing_bookings
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE OR REPLACE TRIGGER trg_audit_valuation_requests
AFTER INSERT OR UPDATE OR DELETE ON public.valuation_requests
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

CREATE OR REPLACE TRIGGER trg_audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();

REVOKE EXECUTE ON FUNCTION public.audit_log_trigger() FROM PUBLIC, anon, authenticated;

-- 3.7 record_audit RPC function for admin operations
CREATE OR REPLACE FUNCTION public.record_audit(
  p_action text,
  p_entity_name text,
  p_entity_id uuid,
  p_details jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.is_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Only administrators can record custom audit entries.';
  END IF;

  INSERT INTO public.audit_logs (user_id, action, entity_name, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_name, p_entity_id, p_details)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_audit(text, text, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_audit(text, text, uuid, jsonb) TO authenticated;


-- 4. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valuation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4.1 profiles policies
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR public.is_admin()
);

CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  id = auth.uid() OR public.is_admin()
) WITH CHECK (
  id = auth.uid() OR public.is_admin()
);

CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
  id = auth.uid() OR public.is_admin()
);

-- 4.2 properties policies
CREATE POLICY "properties_select_policy" ON public.properties
FOR SELECT USING (
  status = 'available' OR public.is_admin()
);

CREATE POLICY "properties_admin_insert" ON public.properties
FOR INSERT WITH CHECK (
  public.is_admin()
);

CREATE POLICY "properties_admin_update" ON public.properties
FOR UPDATE USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

CREATE POLICY "properties_admin_delete" ON public.properties
FOR DELETE USING (
  public.is_admin()
);

-- 4.3 property_images policies
CREATE POLICY "property_images_select_policy" ON public.property_images
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_images.property_id
      AND (p.status = 'available' OR public.is_admin())
  )
);

CREATE POLICY "property_images_admin_insert" ON public.property_images
FOR INSERT WITH CHECK (
  public.is_admin()
);

CREATE POLICY "property_images_admin_update" ON public.property_images
FOR UPDATE USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

CREATE POLICY "property_images_admin_delete" ON public.property_images
FOR DELETE USING (
  public.is_admin()
);

-- 4.4 viewing_bookings policies
CREATE POLICY "viewing_bookings_select_policy" ON public.viewing_bookings
FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "viewing_bookings_insert_policy" ON public.viewing_bookings
FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_active = true
  )) OR public.is_admin()
);

CREATE POLICY "viewing_bookings_admin_update" ON public.viewing_bookings
FOR UPDATE USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

CREATE POLICY "viewing_bookings_admin_delete" ON public.viewing_bookings
FOR DELETE USING (
  public.is_admin()
);

-- 4.5 valuation_requests policies
CREATE POLICY "valuation_requests_select_policy" ON public.valuation_requests
FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "valuation_requests_insert_policy" ON public.valuation_requests
FOR INSERT WITH CHECK (
  (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_active = true
  )) OR public.is_admin()
);

CREATE POLICY "valuation_requests_admin_update" ON public.valuation_requests
FOR UPDATE USING (
  public.is_admin()
) WITH CHECK (
  public.is_admin()
);

CREATE POLICY "valuation_requests_admin_delete" ON public.valuation_requests
FOR DELETE USING (
  public.is_admin()
);

-- 4.6 audit_logs policies
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
FOR SELECT USING (
  public.is_admin()
);


-- 5. STORAGE BUCKET (property-images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "storage_property_images_public_read" ON storage.objects
FOR SELECT USING (
  bucket_id = 'property-images'
);

CREATE POLICY "storage_property_images_admin_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images' AND public.is_admin()
);

CREATE POLICY "storage_property_images_admin_update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'property-images' AND public.is_admin()
) WITH CHECK (
  bucket_id = 'property-images' AND public.is_admin()
);

CREATE POLICY "storage_property_images_admin_delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images' AND public.is_admin()
);


-- 6. DEMO SEED DATA
DO $$
DECLARE
  v_p1 uuid := gen_random_uuid();
  v_p2 uuid := gen_random_uuid();
  v_p3 uuid := gen_random_uuid();
  v_p4 uuid := gen_random_uuid();
  v_p5 uuid := gen_random_uuid();
  v_p6 uuid := gen_random_uuid();
  v_p7 uuid := gen_random_uuid();
  v_p8 uuid := gen_random_uuid();
  v_p9 uuid := gen_random_uuid();
  v_p10 uuid := gen_random_uuid();
BEGIN
  -- 10 realistic properties across Nairobi
  INSERT INTO public.properties (id, title, description, category, listing_type, location, price, bedrooms, bathrooms, size_sqft, status, is_featured)
  VALUES
    (
      v_p1,
      'Executive 4-Bedroom Townhouse with DSQ',
      'An exquisite, newly completed 4-bedroom townhouse situated in a gated community in Lavington. Highlights include all ensuite bedrooms, expansive hardwood flooring, a bespoke fitted Italian kitchen, and an airy private garden.',
      'residential',
      'sale',
      'Lavington, Nairobi',
      65000000.00,
      4,
      5,
      3800.00,
      'available',
      true
    ),
    (
      v_p2,
      'Grade A Commercial Office Suite',
      'Corporate office suite on the 9th floor of a landmark building in Upper Hill. Fully fitted with dedicated executive boardrooms, fiber backbone connectivity, 4 high-speed passenger elevators, and 6 allocated parking bays.',
      'commercial',
      'rent',
      'Upper Hill, Nairobi',
      280000.00,
      NULL,
      2,
      2400.00,
      'available',
      true
    ),
    (
      v_p3,
      'Modern 3-Bedroom Master Ensuite Apartment',
      'Sophisticated, high-floor residential unit in prime Kilimani along Dennis Pritt Road. Features full backup generator, heated swimming pool, fully equipped residents gym, and borehole water supply.',
      'residential',
      'sale',
      'Kilimani, Nairobi',
      22500000.00,
      3,
      3,
      1950.00,
      'available',
      true
    ),
    (
      v_p4,
      'Colonial 5-Bedroom Villa on Half Acre',
      'A timeless colonial residence nestled in mature indigenous gardens in Karen. Features double-volume living room with wood-burning fireplace, detached 2-bedroom guest wing, solar water heating, and perimeter electric fence.',
      'residential',
      'sale',
      'Karen, Nairobi',
      95000000.00,
      5,
      5,
      5200.00,
      'available',
      true
    ),
    (
      v_p5,
      'Prime Retail & Showroom Space',
      'High-traffic ground floor commercial space in Westlands with prominent road frontage, floor-to-ceiling display glazing, dedicated customer parking, and 24-hour manned security surveillance.',
      'commercial',
      'rent',
      'Westlands, Nairobi',
      450000.00,
      NULL,
      2,
      3500.00,
      'available',
      false
    ),
    (
      v_p6,
      'Luxury 2-Bedroom Serviced Penthouse',
      'Ultra-modern penthouse offering unobstructed skyline views over Westlands. Comes with bespoke contemporary furnishings, wraparound terrace, access to concierge services, rooftop infinity pool, and clubhouse.',
      'residential',
      'rent',
      'Westlands, Nairobi',
      220000.00,
      2,
      2,
      1600.00,
      'available',
      false
    ),
    (
      v_p7,
      'Ambassadorial 4-Bedroom Residence',
      'Magnificent ambassadorial mansion in Runda with grand entrance foyer, private swimming pool, sauna, guard house, and mature 0.5-acre landscaped grounds. Successfully closed and sold.',
      'residential',
      'sale',
      'Runda, Nairobi',
      120000000.00,
      4,
      5,
      6000.00,
      'sold', -- Note: 'sold' status to verify filtering in Public Browsing
      false
    ),
    (
      v_p8,
      'High-Yield 1-Bedroom Investment Apartment',
      'Well-appointed 1-bedroom executive apartment in Kilimani. Proven consistent rental yield with high occupancy, biometric access control, laundromat facility, and rooftop lounge terrace.',
      'residential',
      'rent',
      'Kilimani, Nairobi',
      85000.00,
      1,
      1,
      750.00,
      'available',
      false
    ),
    (
      v_p9,
      'Light Logistics & Storage Godown',
      'Modern high-cube warehouse in a secure industrial park off Mombasa Road, Syokimau. 9-meter eaves height, heavy-duty concrete screed, three-phase power supply, and wide container turning apron.',
      'commercial',
      'rent',
      'Syokimau, Nairobi',
      350000.00,
      NULL,
      2,
      5000.00,
      'available',
      false
    ),
    (
      v_p10,
      'Gated Community 4-Bedroom Maisonette',
      'Contemporary family home in a tranquil gated estate along Kiambu Road. Close proximity to international schools, perimeter boundary with razor wire, solar water heating, and children play park.',
      'residential',
      'sale',
      'Kiambu Road, Nairobi',
      38000000.00,
      4,
      3,
      2800.00,
      'available',
      false
    );

  -- 24 image links (1 primary per property)
  INSERT INTO public.property_images (property_id, image_url, is_primary)
  VALUES
    (v_p1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', true),
    (v_p1, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', false),
    (v_p1, 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80', false),

    (v_p2, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', true),
    (v_p2, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', false),
    (v_p2, 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80', false),

    (v_p3, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', true),
    (v_p3, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', false),

    (v_p4, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', true),
    (v_p4, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', false),
    (v_p4, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', false),

    (v_p5, 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', true),
    (v_p5, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80', false),

    (v_p6, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', true),
    (v_p6, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', false),

    (v_p7, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', true),
    (v_p7, 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80', false),

    (v_p8, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', true),
    (v_p8, 'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80', false),

    (v_p9, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80', true),
    (v_p9, 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80', false),

    (v_p10, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', true),
    (v_p10, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80', false);

END $$;
