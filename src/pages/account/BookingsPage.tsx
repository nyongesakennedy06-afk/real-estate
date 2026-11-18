import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AccountNav } from '@/components/account/AccountNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BookingItem {
  id: string;
  property_id: string;
  viewing_date: string;
  viewing_time: string;
  status: string;
  client_notes: string | null;
  created_at: string;
  properties?: {
    id: string;
    title: string;
    location: string;
  } | null;
}

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viewing_bookings')
        .select(`
          id,
          property_id,
          viewing_date,
          viewing_time,
          status,
          client_notes,
          created_at,
          properties (
            id,
            title,
            location
          )
        `)
        .order('viewing_date', { ascending: false });

      if (error) throw error;
      if (data) setBookings(data as unknown as BookingItem[]);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      toast.error('Could not load viewing bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this viewing booking?')) return;
    setCancellingId(id);
    try {
      // 1. Try secure RPC function
      const { error: rpcError } = await supabase.rpc('cancel_my_viewing_booking', {
        booking_id: id,
      });

      if (rpcError) {
        // 2. Fallback to direct update using RLS policy (status 'closed' per PRD)
        const { error: updateError } = await supabase
          .from('viewing_bookings')
          .update({ status: 'closed' })
          .eq('id', id);

        if (updateError) throw updateError;
      }

      toast.success('Booking cancelled.');
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'closed' } : b))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="confirmed">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="pending">Pending</Badge>;
      case 'rescheduled':
        return <Badge variant="rescheduled">Rescheduled</Badge>;
      case 'closed':
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
            My Viewing Appointments
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Track and manage your scheduled property viewings.
          </p>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary-light">
          <Link to="/properties">Browse Properties</Link>
        </Button>
      </div>

      <AccountNav />

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-brand-surface rounded-lg border border-brand-border animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-8 text-center border-brand-border bg-brand-surface space-y-3">
          <p className="text-sm text-brand-muted">You have no viewing appointments scheduled.</p>
          <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-primary-light">
            <Link to="/properties">Explore Listings</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const canCancel =
              b.status === 'pending' || b.status === 'confirmed' || b.status === 'rescheduled';
            return (
              <Card
                key={b.id}
                className="p-5 border-brand-border bg-brand-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(b.status)}
                    <span className="text-xs text-brand-muted">
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {b.properties ? (
                    <Link
                      to={`/properties/${b.properties.id}`}
                      className="font-serif text-base font-bold text-brand-primary hover:text-brand-accent block"
                    >
                      {b.properties.title}
                    </Link>
                  ) : (
                    <span className="font-serif text-base font-bold text-brand-primary">
                      Property Listing
                    </span>
                  )}

                  {b.properties && (
                    <p className="text-xs text-brand-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-accent" />
                      <span>{b.properties.location}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs bg-brand-background px-3 py-2 rounded border border-brand-border flex items-center gap-2.5">
                    <span className="flex items-center gap-1 font-medium text-brand-ink">
                      <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                      {b.viewing_date}
                    </span>
                    <span className="text-brand-border">|</span>
                    <span className="flex items-center gap-1 font-medium text-brand-ink">
                      <Clock className="w-3.5 h-3.5 text-brand-accent" />
                      {b.viewing_time.slice(0, 5)}
                    </span>
                  </div>

                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancel(b.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                    >
                      {cancellingId === b.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Cancel'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
