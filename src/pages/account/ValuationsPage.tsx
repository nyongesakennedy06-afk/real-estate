import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';

export const ValuationsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
            Client Portal
          </span>
          <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
            My Valuation Requests
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            View the appraisal progress of your submitted properties.
          </p>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary-light">
          <Link to="/valuation/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>New Valuation Request</span>
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="border-brand-border bg-brand-surface p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="rescheduled">Under Review</Badge>
                <span className="text-xs text-brand-muted">Submitted Nov 16, 2026</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-primary">
                Commercial Office Block &middot; Upper Hill
              </h3>
              <p className="text-xs text-brand-muted flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-accent" />
                <span>LR 209/14352 &middot; Approx. 0.5 Acre</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Purpose</span>
              <p className="text-sm font-bold text-brand-primary">Mortgage Security</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
