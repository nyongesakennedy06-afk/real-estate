import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/formatters';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Building,
  Edit,
  Trash2,
  X,
  Loader2,
  Upload,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/lib/database.types';

type PropertyRow = Database['public']['Tables']['properties']['Row'] & {
  property_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    storage_path?: string | null;
  }>;
};

export const AdminListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [listingType, setListingType] = useState('sale');
  const [category, setCategory] = useState('residential');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [bathrooms, setBathrooms] = useState<number | ''>('');
  const [sizeSqft, setSizeSqft] = useState<number | ''>('');
  const [status, setStatus] = useState('available');
  const [isFeatured, setIsFeatured] = useState(false);

  // Property Images State (for edit mode)
  const [images, setImages] = useState<
    Array<{ id: string; image_url: string; is_primary: boolean; storage_path?: string | null }>
  >([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const loadProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images(id, image_url, is_primary, storage_path)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProperties(data as PropertyRow[]);
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      toast.error('Could not load properties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const openCreateModal = () => {
    setEditingProperty(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setListingType('sale');
    setCategory('residential');
    setLocation('');
    setBedrooms('');
    setBathrooms('');
    setSizeSqft('');
    setStatus('available');
    setIsFeatured(false);
    setImages([]);
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (prop: PropertyRow) => {
    setEditingProperty(prop);
    setTitle(prop.title);
    setDescription(prop.description || '');
    setPrice(prop.price);
    setListingType(prop.listing_type);
    setCategory(prop.category);
    setLocation(prop.location);
    setBedrooms(prop.bedrooms ?? '');
    setBathrooms(prop.bathrooms ?? '');
    setSizeSqft(prop.size_sqft ?? '');
    setStatus(prop.status);
    setIsFeatured(prop.is_featured);
    setImages(prop.property_images || []);
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || price === '' || Number(price) <= 0) {
      toast.error('Please fill in title, location, and a valid price.');
      return;
    }

    setSaving(true);
    try {
      if (editingProperty) {
        // Update existing property
        const { error } = await supabase
          .from('properties')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            price: Number(price),
            listing_type: listingType,
            category: category,
            location: location.trim(),
            bedrooms: bedrooms === '' ? null : Number(bedrooms),
            bathrooms: bathrooms === '' ? null : Number(bathrooms),
            size_sqft: sizeSqft === '' ? null : Number(sizeSqft),
            status: status,
            is_featured: isFeatured,
          })
          .eq('id', editingProperty.id);

        if (error) throw error;
        toast.success('Property updated successfully.');
      } else {
        // Create new property
        const { data: newProp, error } = await supabase
          .from('properties')
          .insert({
            created_by: user?.id,
            title: title.trim(),
            description: description.trim() || null,
            price: Number(price),
            listing_type: listingType,
            category: category,
            location: location.trim(),
            bedrooms: bedrooms === '' ? null : Number(bedrooms),
            bathrooms: bathrooms === '' ? null : Number(bathrooms),
            size_sqft: sizeSqft === '' ? null : Number(sizeSqft),
            status: status,
            is_featured: isFeatured,
          })
          .select()
          .single();

        if (error) throw error;

        // If a primary image URL was provided during creation
        if (newImageUrl.trim() && newProp?.id) {
          await supabase.from('property_images').insert({
            property_id: newProp.id,
            image_url: newImageUrl.trim(),
            is_primary: true,
          });
        }

        toast.success('Property created successfully.');
      }

      setIsModalOpen(false);
      loadProperties();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save property.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? All associated images and storage files will be permanently deleted.`
      )
    )
      return;

    try {
      // 1. Collect all storage paths from property_images for this property
      const { data: imgRecords } = await supabase
        .from('property_images')
        .select('storage_path')
        .eq('property_id', id);

      const pathsToRemove: string[] = (imgRecords || [])
        .map((img) => img.storage_path)
        .filter((path): path is string => Boolean(path));

      // 2. Also check if any files exist in the property's storage folder
      try {
        const { data: folderFiles } = await supabase.storage
          .from('property-images')
          .list(id);

        if (folderFiles && folderFiles.length > 0) {
          folderFiles.forEach((file) => {
            const fullPath = `${id}/${file.name}`;
            if (!pathsToRemove.includes(fullPath)) {
              pathsToRemove.push(fullPath);
            }
          });
        }
      } catch (err) {
        console.warn('Could not inspect storage folder:', err);
      }

      // 3. Delete files from Supabase Storage bucket
      if (pathsToRemove.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('property-images')
          .remove(pathsToRemove);

        if (storageError) {
          console.warn('Storage cleanup warning:', storageError.message);
        }
      }

      // 4. Delete property from DB (ON DELETE CASCADE removes property_images and viewing_bookings rows)
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;

      toast.success('Property and all associated images deleted.');
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete property.');
    }
  };

  // Upload file image to Supabase Storage bucket 'property-images'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProperty) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${editingProperty.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      const isFirst = images.length === 0;

      const { data: imgRecord, error: dbError } = await supabase
        .from('property_images')
        .insert({
          property_id: editingProperty.id,
          image_url: publicUrl,
          storage_path: fileName,
          is_primary: isFirst,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setImages((prev) => [...prev, imgRecord]);
      toast.success('Image uploaded.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Add image by URL
  const handleAddImageUrl = async () => {
    if (!newImageUrl.trim() || !editingProperty) return;
    try {
      const isFirst = images.length === 0;
      const { data: imgRecord, error } = await supabase
        .from('property_images')
        .insert({
          property_id: editingProperty.id,
          image_url: newImageUrl.trim(),
          is_primary: isFirst,
        })
        .select()
        .single();

      if (error) throw error;

      setImages((prev) => [...prev, imgRecord]);
      setNewImageUrl('');
      toast.success('Image added.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add image.');
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    if (!editingProperty) return;
    try {
      // Set all images to false, then target image to true
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', editingProperty.id);

      await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      );
      toast.success('Primary image updated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to set primary image.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const targetImage = images.find((img) => img.id === imageId);

      // If stored in Supabase storage bucket, clean up the file
      if (targetImage?.storage_path) {
        await supabase.storage
          .from('property-images')
          .remove([targetImage.storage_path]);
      }

      const { error } = await supabase.from('property_images').delete().eq('id', imageId);
      if (error) throw error;

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image deleted.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete image.');
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
            Property Listings
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Create, update, and manage property catalog and photography.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-brand-primary hover:bg-brand-primary-light flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-brand-border bg-white text-xs text-brand-ink"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
            <Badge variant="outline" className="text-xs">
              Total: {filteredProperties.length}
            </Badge>
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-brand-muted">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-muted mb-2" />
                      Loading listings...
                    </td>
                  </tr>
                ) : filteredProperties.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-brand-muted">
                      No matching properties found.
                    </td>
                  </tr>
                ) : (
                  filteredProperties.map((p) => {
                    const primaryImg =
                      p.property_images?.find((img) => img.is_primary)?.image_url ||
                      p.property_images?.[0]?.image_url;

                    return (
                      <tr key={p.id} className="hover:bg-brand-background/40 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-brand-border/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building className="w-5 h-5 text-brand-muted" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-brand-primary flex items-center gap-1.5">
                              <span>{p.title}</span>
                              {p.is_featured && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <div className="text-xs text-brand-muted">{p.location}</div>
                            {(p.bedrooms || p.bathrooms || p.size_sqft) && (
                              <div className="text-[11px] text-brand-muted/80 mt-0.5">
                                {[
                                  p.bedrooms ? `${p.bedrooms} beds` : null,
                                  p.bathrooms ? `${p.bathrooms} baths` : null,
                                  p.size_sqft ? `${Number(p.size_sqft).toLocaleString()} sq ft` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 capitalize text-xs">
                          {p.listing_type === 'sale' ? 'Sale' : 'Rent'} &middot; {p.category}
                        </td>

                        <td className="py-3 px-4 font-semibold text-xs">
                          {formatPrice(p.price, p.listing_type)}
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              p.status === 'available'
                                ? 'confirmed'
                                : p.status === 'reserved'
                                ? 'pending'
                                : 'closed'
                            }
                            className="capitalize"
                          >
                            {p.status.replace('_', ' ')}
                          </Badge>
                        </td>

                        <td className="py-3 px-4 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(p)}
                            className="h-8 px-2 text-xs text-brand-primary"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            <span>Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProperty(p.id, p.title)}
                            className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-2xl bg-brand-surface border-brand-border p-6 relative shadow-xl my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-brand-muted hover:text-brand-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-brand-primary mb-4">
              {editingProperty ? 'Edit Property' : 'Add New Property'}
            </h2>

            <form onSubmit={handleSaveProperty} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">Property Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern 4-Bedroom Townhouse"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Listing Type *</label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">To Rent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Price in KES *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 45000000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Physical Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lavington, Nairobi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                </div>
              </div>

              {/* Bedrooms, Bathrooms, Floor Area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Bedrooms (Rooms)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 4"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Floor Area (Sq Ft)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 3200"
                    value={sizeSqft}
                    onChange={(e) => setSizeSqft(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>

                <div className="flex items-center pt-6 gap-2">
                  <input
                    type="checkbox"
                    id="featured-toggle"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-brand-primary rounded border-brand-border"
                  />
                  <label htmlFor="featured-toggle" className="text-xs font-semibold text-brand-ink cursor-pointer">
                    Feature on Homepage
                  </label>
                </div>
              </div>

              {/* Description (text column that displays under image gallery) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">
                  Description (shown under the gallery)
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter detailed property description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-brand-border bg-white text-xs text-brand-ink"
                />
              </div>

              {/* Primary Image URL for new properties */}
              {!editingProperty && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">
                    Primary Image URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                  <p className="text-[11px] text-brand-muted">
                    Direct file uploads and multiple gallery images can also be managed anytime via the Edit button.
                  </p>
                </div>
              )}

              {/* Image Management Section (when editing) */}
              {editingProperty && (
                <div className="pt-4 border-t border-brand-border space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Property Images ({images.length})</span>
                  </h3>

                  {/* Upload Controls */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingImage}
                        className="border-brand-border text-xs h-9"
                        asChild
                      >
                        <span>
                          {uploadingImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          <span>Upload File</span>
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste image URL..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 h-9 px-3 rounded-md border border-brand-border bg-white text-xs text-brand-ink"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddImageUrl}
                        className="border-brand-border text-xs h-9"
                      >
                        Add URL
                      </Button>
                    </div>
                  </div>

                  {/* Thumbnail List */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {images.map((img) => (
                        <div
                          key={img.id}
                          className={`relative rounded-lg overflow-hidden border p-1 bg-white ${
                            img.is_primary ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-brand-border'
                          }`}
                        >
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-20 object-cover rounded"
                          />
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            {img.is_primary ? (
                              <span className="font-semibold text-brand-primary">Primary</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(img.id)}
                                className="text-brand-muted hover:text-brand-ink underline"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="text-rose-600 hover:text-rose-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-brand-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="border-brand-border text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-primary hover:bg-brand-primary-light text-white text-xs h-9 px-5"
                >
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Property'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
