import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building,
  CalendarCheck,
  ClipboardList,
  Users,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';

interface OverviewMetrics {
  totalProperties: number;
  availableProperties: number;
  pendingBookings: number;
  pendingValuations: number;
  totalUsers: number;
}

interface RecentBooking {
  id: string;
  viewing_date: string;
  viewing_time: string;
  status: string;
  properties?: { title: string } | null;
  profiles?: { full_name: string; email: string } | null;
}

interface RecentValuation {
  id: string;
  location: string;
  property_category: string;
  purpose: string;
  status: string;
  created_at: string;
}

export const AdminOverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    totalProperties: 0,
    availableProperties: 0,
    pendingBookings: 0,
    pendingValuations: 0,
    totalUsers: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentValuations, setRecentValuations] = useState<RecentValuation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Counts
        const [
          { count: propCount },
          { count: availCount },
          { count: bookingCount },
          { count: valCount },
          { count: userCount },
        ] = await Promise.all([
          supabase.from('properties').select('*', { count: 'exact', head: true }),
          supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available'),
          supabase
            .from('viewing_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase
            .from('valuation_requests')
            .select('*', { count: 'exact', head: true })
            .in('status', ['submitted', 'pending']),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
        ]);

        setMetrics({
          totalProperties: propCount || 0,
          availableProperties: availCount || 0,
          pendingBookings: bookingCount || 0,
          pendingValuations: valCount || 0,
          totalUsers: userCount || 0,
        });

        // Recent Bookings
        const { data: bookingsData } = await supabase
          .from('viewing_bookings')
          .select(`
            id,
            viewing_date,
            viewing_time,
            status,
            properties (title),
            profiles (full_name, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (bookingsData) {
          setRecentBookings(bookingsData as unknown as RecentBooking[]);
        }

        // Recent Valuations
        const { data: valuationsData } = await supabase
          .from('valuation_requests')
          .select('id, location, property_category, purpose, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (valuationsData) {
          setRecentValuations(valuationsData as RecentValuation[]);
        }
      } catch (err) {
        console.error('Error loading admin overview metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
          Operations Dashboard
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Realtime metrics for property listings, site visits, and valuation requests.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-brand-muted uppercase">
              Total Properties
            </CardTitle>
            <Building className="w-4 h-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-brand-primary">
              {metrics.totalProperties}
            </div>
            <p className="text-xs text-brand-muted mt-1">
              {metrics.availableProperties} available
            </p>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-brand-muted uppercase">
              Pending Bookings
            </CardTitle>
            <CalendarCheck className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-amber-800">
              {metrics.pendingBookings}
            </div>
            <p className="text-xs text-brand-muted mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-brand-muted uppercase">
              Pending Valuations
            </CardTitle>
            <ClipboardList className="w-4 h-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-sky-800">
              {metrics.pendingValuations}
            </div>
            <p className="text-xs text-brand-muted mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-brand-muted uppercase">
              Registered Users
            </CardTitle>
            <Users className="w-4 h-4 text-brand-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif text-brand-primary">
              {metrics.totalUsers}
            </div>
            <p className="text-xs text-brand-muted mt-1">Clients &amp; team</p>
          </CardContent>
        </Card>
      </div>

      {/* Two columns for recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings */}
        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-brand-border">
            <CardTitle className="text-base font-serif font-bold text-brand-primary">
              Recent Viewing Requests
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link to="/admin/bookings" className="flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-brand-muted" />
              </div>
            ) : recentBookings.length === 0 ? (
              <p className="text-xs text-brand-muted py-4 text-center">No viewing requests yet.</p>
            ) : (
              recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-md bg-brand-background border border-brand-border flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-brand-primary">
                      {b.properties?.title || 'Property'}
                    </p>
                    <p className="text-brand-muted">
                      {b.profiles?.full_name || b.profiles?.email || 'Client'} &middot;{' '}
                      {b.viewing_date} at {b.viewing_time.slice(0, 5)}
                    </p>
                  </div>
                  <Badge variant={b.status === 'confirmed' ? 'confirmed' : 'pending'}>
                    {b.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Valuations */}
        <Card className="border-brand-border bg-brand-surface">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-brand-border">
            <CardTitle className="text-base font-serif font-bold text-brand-primary">
              Recent Valuation Requests
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs h-8">
              <Link to="/admin/valuations" className="flex items-center gap-1">
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {loading ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-brand-muted" />
              </div>
            ) : recentValuations.length === 0 ? (
              <p className="text-xs text-brand-muted py-4 text-center">No valuation requests yet.</p>
            ) : (
              recentValuations.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-md bg-brand-background border border-brand-border flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-brand-primary">{v.location}</p>
                    <p className="text-brand-muted capitalize">
                      {v.property_category} &middot; Purpose: {v.purpose.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge
                    variant={
                      v.status === 'completed'
                        ? 'confirmed'
                        : v.status === 'under_review' || v.status === 'in_review'
                        ? 'rescheduled'
                        : 'pending'
                    }
                  >
                    <span className="capitalize">{v.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
