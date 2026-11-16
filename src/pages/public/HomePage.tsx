import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Search,
  Building,
  Award,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Database } from '@/lib/database.types';

type PropertyWithImages = Database['public']['Tables']['properties']['Row'] & {
  property_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Quick search state
  const [listingType, setListingType] = useState('all');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Featured listings state
  const [featuredProperties, setFeaturedProperties] = useState<PropertyWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*, property_images(id, image_url, is_primary)')
          .eq('status', 'available')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error loading featured properties:', error.message);
        } else {
          setFeaturedProperties((data as PropertyWithImages[]) || []);
        }
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadFeatured();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (listingType && listingType !== 'all') params.set('listing_type', listingType);
    if (category && category !== 'all') params.set('category', category);
    if (location.trim()) params.set('location', location.trim());
    if (maxPrice.trim() && !isNaN(Number(maxPrice))) params.set('max_price', maxPrice.trim());

    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* 1. Hero Section & Quick Search Bar */}
      <section className="relative bg-gradient-to-b from-brand-surface to-brand-background border-b border-brand-border py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
              Established Nairobi Surveyors &amp; Valuers
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-brand-primary leading-[1.15]">
              Property, valued and managed with care.
            </h1>
            <p className="text-lg sm:text-xl text-brand-muted leading-relaxed font-light">
              Kiragu &amp; Mwangi Ltd provides dependable residential and commercial valuation, asset appraisal, and professional property management across the greater Nairobi metropolitan area.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" asChild className="bg-brand-primary hover:bg-brand-primary-light text-white">
                <Link to="/properties" className="flex items-center gap-2">
                  <span>Browse Properties</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-brand-primary text-brand-primary hover:bg-brand-surface">
                <Link to="/valuation/new">Request a Valuation</Link>
              </Button>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="mt-12 p-5 sm:p-6 bg-brand-surface rounded-2xl border border-brand-border shadow-sm">
            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Listing Type
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <option value="all">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <option value="all">All Categories</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kilimani, Westlands"
                  className="w-full h-11 px-3.5 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Max Price (KES)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 50000000"
                  className="w-full h-11 px-3.5 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-brand-accent hover:bg-brand-accent-hover text-white flex items-center justify-center gap-2 font-medium shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Properties</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. Featured Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
              Curated Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary mt-1">
              Featured Properties
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              Hand-selected commercial and residential opportunities verified by our surveyors.
            </p>
          </div>
          <Button variant="link" asChild className="p-0 text-brand-primary self-start sm:self-auto font-semibold">
            <Link to="/properties" className="flex items-center gap-1.5">
              <span>View all available listings</span>
              <ArrowRight className="w-4 h-4 text-brand-accent" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <Card key={idx} className="overflow-hidden border-brand-border bg-brand-surface animate-pulse">
                <div className="aspect-[16/10] bg-brand-border/40" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-1/3 bg-brand-border/60 rounded" />
                  <div className="h-6 w-3/4 bg-brand-border/60 rounded" />
                  <div className="h-5 w-1/2 bg-brand-border/60 rounded" />
                </div>
              </Card>
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property, idx) => (
              <PropertyCard key={property.id} property={property} priority={idx < 3} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-brand-surface rounded-xl border border-brand-border text-brand-muted text-sm">
            No featured properties currently listed.
          </div>
        )}
      </section>

      {/* 3. Our Services / Practice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
            Core Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">
            Dedicated Professional Real Estate Services
          </h2>
          <p className="text-brand-muted text-sm sm:text-base font-light leading-relaxed">
            Providing institutional and private clients with sound, market-informed valuation and hands-on property administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-7 space-y-4 border-brand-border bg-brand-surface hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
              <Building className="w-6 h-6 text-brand-accent" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-primary">
              Property Listings
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed font-light">
              Verified residential and commercial properties for sale and lease across Nairobi, vetted for legal clarity and market alignment.
            </p>
          </Card>

          <Card className="p-7 space-y-4 border-brand-border bg-brand-surface hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
              <Calendar className="w-6 h-6 text-brand-accent" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-primary">
              Site Viewings
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed font-light">
              Convenient appointment booking with licensed surveyors and property managers, available Monday through Saturday.
            </p>
          </Card>

          <Card className="p-7 space-y-4 border-brand-border bg-brand-surface hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
              <Award className="w-6 h-6 text-brand-accent" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-primary">
              Valuation Services
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed font-light">
              Comprehensive valuation reports for mortgage security, asset appraisal, probate, insurance, and statutory requirements.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. Trust Strip */}
      <section className="bg-brand-primary text-brand-surface py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-brand-primary-light/40">
            <div className="pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">25+</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider font-medium">
                Years in Nairobi
              </div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">500+</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider font-medium">
                Properties Managed
              </div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">100%</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider font-medium">
                Licensed Valuers
              </div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">KES 50B+</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider font-medium">
                Assets Appraised
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Closing CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-sm">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 justify-center md:justify-start text-xs font-bold text-brand-accent uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Surveyor Department</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
              Need a formal property valuation report?
            </h2>
            <p className="text-brand-muted text-sm sm:text-base font-light">
              Submit your property details and LR number online. Our valuation department will review your specifications and schedule a field survey promptly.
            </p>
          </div>
          <Button size="lg" asChild className="bg-brand-accent hover:bg-brand-accent-hover text-white flex-shrink-0 shadow-sm">
            <Link to="/valuation/new">Request Valuation Online</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
