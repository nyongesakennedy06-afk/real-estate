import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, formatNumber } from '@/lib/formatters';
import { MapPin, Bed, Bath, Square, Building2 } from 'lucide-react';
import type { Database } from '@/lib/database.types';

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
};

interface PropertyCardProps {
  property: Property;
  priority?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, priority = false }) => {
  // Determine primary image or first available image
  const primaryImage =
    property.property_images?.find((img) => img.is_primary)?.image_url ||
    property.property_images?.[0]?.image_url;

  const isSale = property.listing_type === 'sale';
  const isResidential = property.category === 'residential';

  return (
    <Link to={`/properties/${property.id}`} className="group block focus:outline-none">
      <Card className="h-full flex flex-col overflow-hidden border-brand-border bg-brand-surface hover:border-brand-primary/40 hover:shadow-md transition-all duration-200">
        {/* Image Container - Fixed 16:10 aspect ratio */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-border/30">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={property.title}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-brand-muted bg-brand-background">
              <Building2 className="w-10 h-10 opacity-30" />
              <span className="text-xs mt-1 font-medium">No Image Available</span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded shadow-sm ${
                isSale ? 'bg-brand-primary text-white' : 'bg-brand-accent text-white'
              }`}
            >
              {isSale ? 'For Sale' : 'For Rent'}
            </span>
            <span className="bg-brand-surface/95 backdrop-blur-sm text-brand-ink border border-brand-border text-xs font-semibold px-2.5 py-1 rounded shadow-sm">
              {isResidential ? 'Residential' : 'Commercial'}
            </span>
          </div>

          {property.is_featured && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-brand-accent-light text-brand-accent border border-brand-accent/40 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
                Featured
              </span>
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-accent">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg font-bold text-brand-primary group-hover:text-brand-accent transition-colors line-clamp-2 leading-snug">
              {property.title}
            </h3>

            {/* Price */}
            <p className="text-lg font-bold text-brand-ink pt-1">
              {formatPrice(property.price, property.listing_type)}
            </p>
          </div>

          {/* Amenities / Specs Row */}
          <div className="pt-3 border-t border-brand-border/80 flex items-center justify-between text-xs text-brand-muted">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {property.bedrooms !== null && property.bedrooms !== undefined && (
                <div className="flex items-center gap-1" title={`${property.bedrooms} Bedrooms`}>
                  <Bed className="w-3.5 h-3.5 text-brand-accent" />
                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                </div>
              )}

              {property.bathrooms !== null && property.bathrooms !== undefined && (
                <div className="flex items-center gap-1" title={`${property.bathrooms} Bathrooms`}>
                  <Bath className="w-3.5 h-3.5 text-brand-accent" />
                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                </div>
              )}

              {property.size_sqft !== null && property.size_sqft !== undefined && (
                <div className="flex items-center gap-1" title={`${formatNumber(property.size_sqft)} sq ft`}>
                  <Square className="w-3.5 h-3.5 text-brand-accent" />
                  <span>{formatNumber(property.size_sqft)} sq ft</span>
                </div>
              )}
            </div>

            {property.status !== 'available' && (
              <Badge variant="closed" className="text-[10px] uppercase font-bold">
                {property.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
