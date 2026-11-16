import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Building, CalendarCheck, ClipboardList, Users, ArrowUpRight } from 'lucide-react';

export const AdminOverviewPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
          Operations &amp; Metrics
        </span>
        <h1 className="text-3xl font-serif font-bold text-brand-primary mt-1">
          Management Dashboard
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Realtime overview of listings, pending viewing requests, and valuation jobs.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-brand-muted">
              Total Properties
            </CardTitle>
            <Building className="w-4 h-4 text-brand-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-brand-primary">12</div>
            <p className="text-xs text-brand-muted mt-1">10 Available &middot; 2 Sold/Rented</p>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-brand-muted">
              Pending Bookings
            </CardTitle>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-brand-primary">4</div>
            <p className="text-xs text-amber-700 font-medium mt-1">Requires confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-brand-muted">
              Submitted Valuations
            </CardTitle>
            <ClipboardList className="w-4 h-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-brand-primary">3</div>
            <p className="text-xs text-sky-700 font-medium mt-1">Awaiting surveyor review</p>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-sans font-medium text-brand-muted">
              Active Users
            </CardTitle>
            <Users className="w-4 h-4 text-brand-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-brand-primary">28</div>
            <p className="text-xs text-brand-muted mt-1">Clients &amp; administrators</p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Pending Bookings */}
        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Viewing Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/admin/bookings" className="flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3.5 rounded-lg border border-brand-border bg-brand-background flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-brand-primary">Alice Wanjiku</p>
                  <p className="text-brand-muted">Penthouse &middot; Tomorrow at 10:00 AM</p>
                </div>
                <Badge variant="pending">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Latest Valuations */}
        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Valuation Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link to="/admin/valuations" className="flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-3.5 rounded-lg border border-brand-border bg-brand-background flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-brand-primary">LR 209/14352 &middot; Upper Hill</p>
                  <p className="text-brand-muted">David Kariuki &middot; Commercial Appraisal</p>
                </div>
                <Badge variant="pending">Submitted</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
