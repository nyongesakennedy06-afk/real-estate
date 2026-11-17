import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/formatters';
import { BookingModal } from '@/components/booking/BookingModal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Building2,
  Calendar,
  ArrowLeft,
  Share2,
  Check,
} from 'lucide-react';
import type { Database } from '@/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
};

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*, property_images(id, image_url, is_primary)')
          .eq('id', id)
          .single();

        if (error || !data) {
          console.error('Error fetching property:', error?.message);
          setProperty(null);
        } else {
          // Sort images so primary is first
          const sortedImages = [...(data.property_images || [])].sort((a, b) =>
            a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1
          );
          setProperty({ ...data, property_images: sortedImages });
          setSelectedImageIndex(0);
        }
      } catch (err) {
        console.error('Failed to load property details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProperty();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookViewingClick = () => {
    if (!user) {
      navigate(`/login?returnUrl=/properties/${id}`);
    } else {
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
        <div className="h-6 w-36 bg-brand-border/60 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[3/2] bg-brand-border/60 rounded-xl" />
            <div className="h-32 bg-brand-surface rounded-xl border border-brand-border" />
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-brand-surface rounded-xl border border-brand-border" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-background border border-brand-border mx-auto flex items-center justify-center text-brand-muted">
          <Building2 className="w-8 h-8 opacity-40" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
          Property Not Found
        </h1>
        <p className="text-sm text-brand-muted max-w-md mx-auto">
          The property listing you are requesting might be unavailable, private, or has been removed.
        </p>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary-light">
          <Link to="/properties" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Listings</span>
          </Link>
        </Button>
      </div>
    );
  }

  const images = property.property_images || [];
  const activeImage = images[selectedImageIndex]?.image_url;
  const isAvailable = property.status === 'available';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button & Actions Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="text-brand-muted hover:text-brand-primary">
          <Link to="/properties" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="border-brand-border text-xs flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Listing</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Grid: Gallery & Description on Left, Key Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 Cols): Image Gallery & Description directly beneath */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Image Gallery */}
          <div className="space-y-3">
            {/* Main Image Container (Aspect 3:2) */}
            <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden bg-brand-border/30 border border-brand-border shadow-sm">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-brand-muted bg-brand-background">
                  <Building2 className="w-16 h-16 opacity-30" />
                  <span className="text-sm mt-2 font-medium">No Images Provided</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-brand-primary ring-2 ring-brand-primary/20'
                        : 'border-brand-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Property Description: Directly below image gallery, leaving no blank spaces */}
          <div className="p-6 sm:p-8 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-3">
            <h2 className="font-serif text-xl font-bold text-brand-primary">
              Description
            </h2>
            <p className="text-brand-ink/90 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
              {property.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Right Column (1 Col): Title, Price, Location & Simple Action */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card className="p-6 border-brand-border bg-brand-surface space-y-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-brand-primary text-white">
                {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
              </span>
              <Badge variant="outline" className="text-xs capitalize">
                {property.category}
              </Badge>
              {!isAvailable && (
                <Badge variant="closed" className="text-xs capitalize ml-auto">
                  {property.status}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary leading-tight">
                {property.title}
              </h1>
              <p className="text-sm text-brand-muted flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-accent flex-shrink-0" />
                <span>{property.location}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-brand-border">
              <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">
                Asking Price
              </span>
              <p className="text-3xl font-serif font-bold text-brand-primary mt-1">
                {formatPrice(property.price, property.listing_type)}
              </p>
            </div>

            <div className="pt-2">
              {isAvailable ? (
                <Button
                  onClick={handleBookViewingClick}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-primary-light text-white font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{user ? 'Book a Viewing' : 'Sign In to Book Viewing'}</span>
                </Button>
              ) : (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-medium">
                  This property is currently {property.status}.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {property && (
        <BookingModal
          propertyId={property.id}
          propertyTitle={property.title}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => navigate('/account/bookings')}
        />
      )}
    </div>
  );
};
