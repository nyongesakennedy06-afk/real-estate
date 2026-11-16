import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Building,
  X,
} from 'lucide-react';
import type { Database } from '@/lib/database.types';

type PropertyWithImages = Database['public']['Tables']['properties']['Row'] & {
  property_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
};

const PAGE_SIZE = 9;

export const ListingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query params
  const listingType = searchParams.get('listing_type') || 'all';
  const category = searchParams.get('category') || 'all';
  const locationQuery = searchParams.get('location') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const bedrooms = searchParams.get('bedrooms') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local state for the search input before user submits
  const [localLocation, setLocalLocation] = useState(locationQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Query state
  const [properties, setProperties] = useState<PropertyWithImages[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sync local location input when URL changes
  useEffect(() => {
    setLocalLocation(locationQuery);
  }, [locationQuery]);

  // Fetch properties from Supabase
  useEffect(() => {
    async function fetchProperties() {
      setIsLoading(true);

      try {
        let query = supabase
          .from('properties')
          .select('*, property_images(id, image_url, is_primary)', { count: 'exact' })
          .eq('status', 'available');

        // Apply filters
        if (listingType && listingType !== 'all') {
          query = query.eq('listing_type', listingType);
        }

        if (category && category !== 'all') {
          query = query.eq('category', category);
        }

        if (locationQuery.trim()) {
          query = query.ilike('location', `%${locationQuery.trim()}%`);
        }

        if (minPrice && !isNaN(Number(minPrice))) {
          query = query.gte('price', Number(minPrice));
        }

        if (maxPrice && !isNaN(Number(maxPrice))) {
          query = query.lte('price', Number(maxPrice));
        }

        if (bedrooms && bedrooms !== 'all' && !isNaN(Number(bedrooms))) {
          query = query.gte('bedrooms', Number(bedrooms));
        }

        // Apply sorting
        if (sort === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sort === 'price_desc') {
          query = query.order('price', { ascending: false });
        } else {
          // Default: newest first
          query = query.order('created_at', { ascending: false });
        }

        // Apply pagination
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
          console.error('Error fetching listings:', error.message);
          setProperties([]);
          setTotalCount(0);
        } else {
          setProperties((data as PropertyWithImages[]) || []);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Failed to load listings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProperties();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [listingType, category, locationQuery, minPrice, maxPrice, bedrooms, sort, currentPage]);

  // Helper to update search params
  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Always reset to page 1 on filter change (unless changing page itself)
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('location', localLocation);
  };

  const clearAllFilters = () => {
    setLocalLocation('');
    setSearchParams(new URLSearchParams());
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasActiveFilters =
    listingType !== 'all' ||
    category !== 'all' ||
    Boolean(locationQuery) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    bedrooms !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-border pb-6 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
            Kiragu &amp; Mwangi Portfolio
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary mt-1">
            Properties in Nairobi
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Browse verified residential and commercial opportunities for sale and lease.
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden flex items-center gap-2 border-brand-border"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-accent" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
            )}
          </Button>

          <div className="flex items-center gap-2 text-sm text-brand-ink">
            <span className="text-xs text-brand-muted whitespace-nowrap hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="h-10 px-3 rounded-md border border-brand-border bg-brand-surface text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Desktop Filters Panel (Always visible on md+, collapsible on mobile) */}
      <div className={`${mobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
        <Card className="p-5 border-brand-border bg-brand-surface shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
              <SlidersHorizontal className="w-4 h-4 text-brand-accent" />
              <span>Search Filters</span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-brand-accent hover:text-brand-accent-hover h-8 px-2 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Listing Type */}
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Listing Type
              </label>
              <select
                value={listingType}
                onChange={(e) => updateParam('listing_type', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="all">All Types</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="all">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Location (Keyword search) */}
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Location
              </label>
              <form onSubmit={handleLocationSubmit} className="relative">
                <input
                  type="text"
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  placeholder="e.g. Westlands, Kilimani"
                  className="w-full h-10 pl-3 pr-8 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2.5 text-brand-muted hover:text-brand-primary"
                  title="Search location"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Max Price (KES)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => updateParam('max_price', e.target.value)}
                placeholder="Any max"
                className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Bedrooms
              </label>
              <select
                value={bedrooms}
                onChange={(e) => updateParam('bedrooms', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="all">Any Bedrooms</option>
                <option value="1">1+ Bedrooms</option>
                <option value="2">2+ Bedrooms</option>
                <option value="3">3+ Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-brand-border/60">
              <span className="text-xs text-brand-muted font-medium">Active Filters:</span>
              {listingType !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <span>Type: {listingType === 'sale' ? 'Sale' : 'Rent'}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('listing_type', 'all')} />
                </Badge>
              )}
              {category !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <span>Category: {category === 'residential' ? 'Residential' : 'Commercial'}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('category', 'all')} />
                </Badge>
              )}
              {locationQuery && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <span>Location: "{locationQuery}"</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('location', '')} />
                </Badge>
              )}
              {maxPrice && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <span>Max Price: KES {Number(maxPrice).toLocaleString()}</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('max_price', '')} />
                </Badge>
              )}
              {bedrooms !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <span>Bedrooms: {bedrooms}+</span>
                  <X className="w-3 h-3 cursor-pointer" onClick={() => updateParam('bedrooms', 'all')} />
                </Badge>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* 3. Listings Grid / Results Header */}
      <div className="flex items-center justify-between text-xs text-brand-muted">
        <span>
          Showing <span className="font-semibold text-brand-ink">{properties.length}</span> of{' '}
          <span className="font-semibold text-brand-ink">{totalCount}</span> available properties
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Card key={idx} className="overflow-hidden border-brand-border bg-brand-surface animate-pulse">
              <div className="aspect-[16/10] bg-brand-border/40" />
              <div className="p-5 space-y-3">
                <div className="h-3 w-1/3 bg-brand-border/60 rounded" />
                <div className="h-5 w-3/4 bg-brand-border/60 rounded" />
                <div className="h-5 w-1/2 bg-brand-border/60 rounded" />
                <div className="pt-3 border-t border-brand-border flex gap-4">
                  <div className="h-3 w-12 bg-brand-border/60 rounded" />
                  <div className="h-3 w-12 bg-brand-border/60 rounded" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-brand-surface rounded-2xl border border-brand-border space-y-4">
          <div className="w-14 h-14 rounded-full bg-brand-background border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
            <Building className="w-6 h-6 opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-brand-primary">
              No properties match your filters
            </h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              We could not find any active listings matching your current criteria. Try widening your price range or adjusting location.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="border-brand-primary text-brand-primary"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        /* Live Properties Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, idx) => (
            <PropertyCard key={property.id} property={property} priority={idx < 3} />
          ))}
        </div>
      )}

      {/* 4. Server-Side Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8 border-t border-brand-border">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => updateParam('page', (currentPage - 1).toString())}
            className="flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center gap-1 px-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => updateParam('page', pageNum.toString())}
                className={`w-9 h-9 rounded-md text-xs font-semibold transition-colors ${
                  pageNum === currentPage
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-ink hover:bg-brand-background border border-transparent hover:border-brand-border'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => updateParam('page', (currentPage + 1).toString())}
            className="flex items-center gap-1 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
