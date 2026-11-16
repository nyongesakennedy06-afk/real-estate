import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, SlidersHorizontal } from 'lucide-react';

export const ListingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const listingType = searchParams.get('listing_type') || 'all';
  const category = searchParams.get('category') || 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-brand-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
            Available Portfolio
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary mt-1">
            Properties in Nairobi
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Browse verified residential and commercial listings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Filter: {listingType !== 'all' ? listingType : 'All Types'} &middot; {category !== 'all' ? category : 'All Categories'}
          </Badge>
        </div>
      </div>

      {/* Filter placeholder info */}
      <div className="bg-brand-surface p-4 rounded-lg border border-brand-border flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-brand-muted">
          <SlidersHorizontal className="w-4 h-4 text-brand-accent" />
          <span>Showing demo search view (Live multi-filtering &amp; database connection configured in Phase 2 &amp; 4).</span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/properties">Reset</Link>
        </Button>
      </div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <Link key={idx} to={`/properties/${idx}`} className="group block focus:outline-none">
            <Card className="overflow-hidden border-brand-border group-hover:border-brand-primary/40 group-hover:shadow-md transition-all">
              <div className="aspect-[16/10] bg-brand-border/40 relative flex items-center justify-center text-brand-muted overflow-hidden">
                <Building className="w-10 h-10 opacity-30 group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-brand-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded">
                    {idx % 2 === 0 ? 'For Rent' : 'For Sale'}
                  </span>
                  <span className="bg-brand-surface text-brand-ink border border-brand-border text-xs font-semibold px-2 py-0.5 rounded">
                    {idx % 3 === 0 ? 'Commercial' : 'Residential'}
                  </span>
                </div>
              </div>
              <CardContent className="p-5 space-y-2">
                <p className="text-xs font-medium text-brand-accent">
                  {idx % 2 === 0 ? 'Westlands, Nairobi' : 'Kilimani, Nairobi'}
                </p>
                <h3 className="font-serif text-lg font-bold text-brand-primary group-hover:text-brand-accent transition-colors">
                  Sample Property Listing {idx}
                </h3>
                <p className="text-brand-ink font-semibold text-lg">
                  {idx % 2 === 0 ? 'KES 150,000 /month' : 'KES 24,000,000'}
                </p>
                <div className="flex items-center gap-4 text-xs text-brand-muted pt-3 border-t border-brand-border">
                  <span>3 Beds</span>
                  <span>&bull;</span>
                  <span>2 Baths</span>
                  <span>&bull;</span>
                  <span>1,850 sq ft</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
