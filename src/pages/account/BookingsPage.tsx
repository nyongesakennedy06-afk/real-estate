import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Building, Clock } from 'lucide-react';

export const BookingsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
            Client Portal
          </span>
          <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
            My Viewing Appointments
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Track status updates for scheduled property visits.
          </p>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary-light">
          <Link to="/properties">Browse More Properties</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="border-brand-border bg-brand-surface p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="pending">Pending Admin Confirmation</Badge>
                <span className="text-xs text-brand-muted">Booked today</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-primary">
                Executive 3-Bedroom Penthouse
              </h3>
              <p className="text-xs text-brand-muted flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-brand-accent" />
                <span>Woodvale Close, Westlands, Nairobi</span>
              </p>
            </div>
            <div className="bg-brand-background p-4 rounded-lg border border-brand-border text-sm flex items-center gap-4">
              <div className="flex items-center gap-2 text-brand-ink">
                <Calendar className="w-4 h-4 text-brand-accent" />
                <span className="font-medium">Tomorrow</span>
              </div>
              <div className="flex items-center gap-2 text-brand-ink">
                <Clock className="w-4 h-4 text-brand-accent" />
                <span className="font-medium">10:30 AM</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
