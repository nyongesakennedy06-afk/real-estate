import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatNumber } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Building2,
  Calendar,
  ClipboardList,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
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
      // In Phase 5, this opens the booking modal/calendar
      const bookingEl = document.getElementById('booking-section');
      if (bookingEl) {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Gallery & Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Image Gallery */}
          <div className="space-y-3">
            {/* Main Image Container (Aspect 3:2) */}
            <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden bg-brand-border/30 border border-brand-border shadow-sm">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={property.title}
                  className="w-full h-full object-cover transition-opacity duration-200"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-brand-muted bg-brand-background">
                  <Building2 className="w-16 h-16 opacity-30" />
                  <span className="text-sm mt-2 font-medium">No Images Provided</span>
                </div>
              )}

              {/* Badges on main image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded shadow-sm ${
                    property.listing_type === 'sale'
                      ? 'bg-brand-primary text-white'
                      : 'bg-brand-accent text-white'
                  }`}
                >
                  {property.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                </span>
                <span className="bg-brand-surface/95 backdrop-blur-sm text-brand-ink border border-brand-border text-xs font-semibold px-3 py-1 rounded shadow-sm">
                  {property.category === 'residential' ? 'Residential' : 'Commercial'}
                </span>
              </div>

              {!isAvailable && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="closed" className="text-xs uppercase font-bold px-3 py-1">
                    {property.status}
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all focus:outline-none ${
                      selectedImageIndex === idx
                        ? 'border-brand-accent ring-2 ring-brand-accent/20 scale-102'
                        : 'border-brand-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Property Title & Overview Card */}
          <Card className="p-6 sm:p-8 border-brand-border bg-brand-surface space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand-accent text-sm font-semibold">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-brand-primary leading-tight">
                {property.title}
              </h1>
              <div className="pt-2">
                <span className="text-xs text-brand-muted uppercase font-bold tracking-wider">
                  Asking Price
                </span>
                <p className="text-3xl font-serif font-bold text-brand-primary">
                  {formatPrice(property.price, property.listing_type)}
                </p>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-brand-border text-center">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-brand-muted font-semibold flex items-center justify-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Bedrooms</span>
                </p>
                <p className="text-base sm:text-lg font-bold text-brand-primary mt-1">
                  {property.bedrooms !== null && property.bedrooms !== undefined
                    ? `${property.bedrooms} Beds`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-brand-muted font-semibold flex items-center justify-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Bathrooms</span>
                </p>
                <p className="text-base sm:text-lg font-bold text-brand-primary mt-1">
                  {property.bathrooms !== null && property.bathrooms !== undefined
                    ? `${property.bathrooms} Baths`
                    : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-brand-muted font-semibold flex items-center justify-center gap-1">
                  <Square className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Floor Area</span>
                </p>
                <p className="text-base sm:text-lg font-bold text-brand-primary mt-1">
                  {property.size_sqft !== null && property.size_sqft !== undefined
                    ? `${formatNumber(property.size_sqft)} sq ft`
                    : 'Unspecified'}
                </p>
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-brand-primary">
                Property Overview
              </h3>
              <p className="text-brand-ink/80 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
                {property.description || 'No detailed description provided for this listing.'}
              </p>
            </div>

            {/* Property Data Reference Table */}
            <div className="pt-4 border-t border-brand-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Listing Reference Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-brand-background p-3 rounded-lg border border-brand-border">
                  <span className="text-brand-muted">Category</span>
                  <p className="font-semibold text-brand-primary capitalize mt-0.5">{property.category}</p>
                </div>
                <div className="bg-brand-background p-3 rounded-lg border border-brand-border">
                  <span className="text-brand-muted">Listing Type</span>
                  <p className="font-semibold text-brand-primary capitalize mt-0.5">{property.listing_type}</p>
                </div>
                <div className="bg-brand-background p-3 rounded-lg border border-brand-border">
                  <span className="text-brand-muted">Status</span>
                  <p className="font-semibold text-brand-primary capitalize mt-0.5">{property.status}</p>
                </div>
                <div className="bg-brand-background p-3 rounded-lg border border-brand-border">
                  <span className="text-brand-muted">Reference</span>
                  <p className="font-mono text-brand-primary mt-0.5">{property.id.substring(0, 8)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions (Sticky on Desktop) */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Main Transaction CTA Card: Site Viewing */}
          <Card id="booking-section" className="border-brand-border bg-brand-surface p-6 space-y-5 shadow-sm">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-accent">
                Direct Appointment
              </span>
              <h3 className="font-serif text-2xl font-bold text-brand-primary">
                Book a Site Viewing
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Schedule a private, accompanied viewing with our licensed property managers.
              </p>
            </div>

            {isAvailable ? (
              <>
                <div className="space-y-2.5 text-xs bg-brand-background p-3.5 rounded-lg border border-brand-border">
                  <div className="flex items-center gap-2 text-brand-ink">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Monday &ndash; Saturday, 09:00 &ndash; 17:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-ink">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Accompanied by licensed surveyor</span>
                  </div>
                  <div className="flex items-center gap-2 text-brand-ink">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>No viewing fees required</span>
                  </div>
                </div>

                <Button
                  onClick={handleBookViewingClick}
                  className="w-full h-12 bg-brand-primary hover:bg-brand-primary-light text-white font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{user ? 'Select Viewing Date & Slot' : 'Sign In to Book Viewing'}</span>
                </Button>

                {!user && (
                  <p className="text-[11px] text-center text-brand-muted">
                    Returning to this listing automatically after sign-in.
                  </p>
                )}
              </>
            ) : (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  This property is currently <strong>{property.status}</strong> and viewing appointment scheduling is closed.
                </span>
              </div>
            )}
          </Card>

          {/* Secondary Action: Request Valuation */}
          <Card className="border-brand-border bg-brand-surface p-6 space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
              <ClipboardList className="w-5 h-5 text-brand-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-brand-primary">
                Need a Certified Valuation?
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                If you own a property in Nairobi requiring a statutory, mortgage, probate, or asset valuation report.
              </p>
            </div>
            <Button
              variant="outline"
              asChild
              className="w-full border-brand-primary text-brand-primary hover:bg-brand-background h-10"
            >
              <Link to="/valuation/new">Request a Property Valuation</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
