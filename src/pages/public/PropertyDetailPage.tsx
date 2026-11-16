import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, MapPin, Calendar, ClipboardList, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="text-brand-muted hover:text-brand-primary">
          <Link to="/properties" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to listings</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Gallery Placeholder */}
          <div className="aspect-[3/2] rounded-xl bg-brand-border/40 border border-brand-border flex flex-col items-center justify-center text-brand-muted relative overflow-hidden">
            <Building className="w-16 h-16 opacity-30" />
            <span className="text-sm mt-2 font-medium">Property Image Gallery (ID: {id})</span>
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="default" className="bg-brand-primary">For Sale</Badge>
              <Badge variant="secondary">Residential</Badge>
            </div>
          </div>

          {/* Details */}
          <div className="bg-brand-surface p-6 sm:p-8 rounded-xl border border-brand-border space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-brand-accent text-sm font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Woodvale Close, Westlands, Nairobi</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-primary">
                Executive 3-Bedroom Penthouse
              </h1>
              <p className="text-2xl font-bold text-brand-ink">
                KES 32,000,000
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-brand-border text-center">
              <div>
                <p className="text-xs uppercase text-brand-muted font-semibold">Bedrooms</p>
                <p className="text-lg font-bold text-brand-primary">3 Beds</p>
              </div>
              <div>
                <p className="text-xs uppercase text-brand-muted font-semibold">Bathrooms</p>
                <p className="text-lg font-bold text-brand-primary">3.5 Baths</p>
              </div>
              <div>
                <p className="text-xs uppercase text-brand-muted font-semibold">Floor Area</p>
                <p className="text-lg font-bold text-brand-primary">2,450 sq ft</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif text-xl font-bold text-brand-primary">Property Description</h3>
              <p className="text-brand-ink/80 text-sm leading-relaxed">
                A meticulously finished penthouse apartment set in a serene enclave of Westlands. Features generous natural lighting, high-end imported fixtures, spacious ensuite bedrooms, DSQ, and panoramic views of the Nairobi skyline.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Actions (Site Viewing & Valuation) */}
        <div className="space-y-6">
          <Card className="p-6 border-brand-border bg-brand-surface space-y-5">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-brand-primary">
                Book a Site Viewing
              </h3>
              <p className="text-xs text-brand-muted">
                Schedule an in-person viewing with our property managers.
              </p>
            </div>

            <div className="space-y-3 text-xs text-brand-muted bg-brand-background p-3.5 rounded-md border border-brand-border">
              <div className="flex items-center gap-2 text-brand-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Monday &ndash; Saturday: 09:00 &ndash; 17:00</span>
              </div>
              <div className="flex items-center gap-2 text-brand-ink">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Accompanied by licensed surveyor</span>
              </div>
            </div>

            <Button className="w-full bg-brand-primary hover:bg-brand-primary-light h-11 flex items-center justify-center gap-2" asChild>
              <Link to="/login?returnUrl=/properties/1">
                <Calendar className="w-4 h-4" />
                <span>Schedule Viewing Slot</span>
              </Link>
            </Button>
          </Card>

          <Card className="p-6 border-brand-border bg-brand-surface space-y-4">
            <h3 className="font-serif text-lg font-bold text-brand-primary">
              Need a Formal Valuation?
            </h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              If you own a comparable property and require a certified bank mortgage or market valuation report.
            </p>
            <Button variant="outline" className="w-full border-brand-primary text-brand-primary" asChild>
              <Link to="/valuation/new" className="flex items-center justify-center gap-2">
                <ClipboardList className="w-4 h-4" />
                <span>Request Valuation</span>
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
