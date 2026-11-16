import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Building, Award, Calendar, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* 1. Hero Section */}
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
              <Button size="lg" asChild className="bg-brand-primary hover:bg-brand-primary-light">
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

          {/* 2. Quick Search Bar */}
          <div className="mt-12 p-4 sm:p-6 bg-brand-surface rounded-xl border border-brand-border shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const params = new URLSearchParams();
                for (const [key, value] of formData.entries()) {
                  if (value) params.append(key, value.toString());
                }
                window.location.href = `/properties?${params.toString()}`;
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Listing Type
                </label>
                <select
                  name="listing_type"
                  className="w-full h-11 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <option value="">All Types</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full h-11 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <option value="">All Categories</option>
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
                  name="location"
                  placeholder="e.g. Kilimani, Westlands"
                  className="w-full h-11 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Max Price (KES)
                </label>
                <input
                  type="number"
                  name="max_price"
                  placeholder="e.g. 25000000"
                  className="w-full h-11 px-3 rounded-md border border-brand-border bg-brand-background text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>

              <div>
                <Button type="submit" className="w-full h-11 bg-brand-accent hover:bg-brand-accent-hover text-white flex items-center justify-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Featured Listings Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
              Curated Portfolio
            </span>
            <h2 className="text-3xl font-serif font-bold text-brand-primary mt-1">
              Featured Properties
            </h2>
          </div>
          <Button variant="link" asChild className="p-0 text-brand-primary self-start sm:self-auto">
            <Link to="/properties" className="flex items-center gap-1.5">
              <span>View all available listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden border-brand-border hover:shadow-md transition-shadow">
              <div className="aspect-[16/10] bg-brand-border/40 relative flex items-center justify-center text-brand-muted">
                <Building className="w-8 h-8 opacity-40" />
                <span className="absolute top-3 left-3 bg-brand-primary text-white text-xs font-semibold px-2.5 py-1 rounded">
                  For Sale
                </span>
              </div>
              <CardContent className="p-5 space-y-2">
                <p className="text-xs font-medium text-brand-accent">Kilimani, Nairobi</p>
                <h3 className="font-serif text-lg font-bold text-brand-primary">
                  Sample Executive Apartment {item}
                </h3>
                <p className="text-brand-ink font-semibold text-base">
                  KES 18,500,000
                </p>
                <p className="text-xs text-brand-muted pt-2 border-t border-brand-border/60">
                  Seed listings will be populated in Phase 2
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Our Practice / Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
            Core Expertise
          </span>
          <h2 className="text-3xl font-serif font-bold text-brand-primary">
            Dedicated Professional Real Estate Services
          </h2>
          <p className="text-brand-muted text-sm sm:text-base">
            Providing institutional and private clients with sound, market-informed valuation and hands-on property administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 space-y-4 border-brand-border bg-brand-surface hover:shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
              <Building className="w-6 h-6 text-brand-accent" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-primary">
              Property Listings
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Verified residential and commercial properties for sale and lease across Nairobi, vetted for legal clarity and market alignment.
            </p>
          </Card>

          <Card className="p-6 space-y-4 border-brand-border bg-brand-surface hover:shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
              <Calendar className="w-6 h-6 text-brand-accent" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-primary">
              Site Viewings
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Convenient appointment booking with licensed surveyors and property managers, available Monday through Saturday.
            </p>
          </Card>

          <Card className="p-6 space-y-4 border-brand-border bg-brand-surface hover:shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-brand-background border border-brand-border flex items-center justify-center text-brand-primary">
              <Award className="w-6 h-6 text-brand-accent" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-primary">
              Valuation Services
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Comprehensive valuation reports for mortgage security, asset appraisal, probate, insurance, and statutory requirements.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Trust Strip */}
      <section className="bg-brand-primary text-brand-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">25+</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider">
                Years in Nairobi
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">500+</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider">
                Properties Managed
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">100%</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider">
                Licensed Valuers
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-serif font-bold text-brand-accent">KES 50B+</div>
              <div className="text-xs sm:text-sm text-brand-surface/80 mt-1 uppercase tracking-wider">
                Assets Appraised
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
              Need a formal property valuation report?
            </h2>
            <p className="text-brand-muted text-sm sm:text-base">
              Submit your property details and LR number online. Our valuation department will review your file promptly.
            </p>
          </div>
          <Button size="lg" asChild className="bg-brand-accent hover:bg-brand-accent-hover text-white flex-shrink-0">
            <Link to="/valuation/new">Request Valuation Online</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};
