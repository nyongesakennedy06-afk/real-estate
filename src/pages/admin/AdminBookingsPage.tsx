import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Check,
  Edit2,
  X,
  Loader2,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

interface BookingRow {
  id: string;
  property_id: string;
  user_id: string;
  viewing_date: string;
  viewing_time: string;
  status: string;
  client_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  properties?: {
    id: string;
    title: string;
    location: string;
  } | null;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string | null;
  } | null;
}

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Notes Modal State
  const [editingNotesBooking, setEditingNotesBooking] = useState<BookingRow | null>(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('viewing_bookings')
        .select(`
          id,
          property_id,
          user_id,
          viewing_date,
          viewing_time,
          status,
          client_notes,
          admin_notes,
          created_at,
          properties (id, title, location),
          profiles:user_id (id, full_name, email, phone_number)
        `)
        .order('viewing_date', { ascending: false });

      if (error) throw error;
      if (data) setBookings(data as unknown as BookingRow[]);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load viewing bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();

    // Realtime channel
    const channel = supabase
      .channel('admin_bookings_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'viewing_bookings' },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('viewing_bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Booking status updated to ${newStatus}.`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const handleOpenNotes = (booking: BookingRow) => {
    setEditingNotesBooking(booking);
    setNotesText(booking.admin_notes || '');
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotesBooking) return;

    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('viewing_bookings')
        .update({ admin_notes: notesText.trim() || null })
        .eq('id', editingNotesBooking.id);

      if (error) throw error;
      toast.success('Admin notes saved.');
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingNotesBooking.id ? { ...b, admin_notes: notesText.trim() || null } : b
        )
      );
      setEditingNotesBooking(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save admin notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const clientName = b.profiles?.full_name?.toLowerCase() || '';
    const clientEmail = b.profiles?.email?.toLowerCase() || '';
    const propTitle = b.properties?.title?.toLowerCase() || '';
    const q = search.toLowerCase();

    const matchesSearch =
      clientName.includes(q) || clientEmail.includes(q) || propTitle.includes(q);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="confirmed">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="pending">Pending</Badge>;
      case 'completed':
        return <Badge variant="closed">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
          Viewing Appointments
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Review, confirm, complete, or cancel accompanied site inspections.
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by client or property..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-brand-border bg-white text-xs text-brand-ink"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Badge variant="outline" className="text-xs">
              Total: {filteredBookings.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-brand-muted">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-muted mb-2" />
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-brand-muted">
                      No matching appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-brand-background/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-brand-primary">
                          {b.profiles?.full_name || 'Client'}
                        </div>
                        <div className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-brand-muted" />
                          <span>{b.profiles?.email}</span>
                        </div>
                        {b.profiles?.phone_number && (
                          <div className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-brand-muted" />
                            <span>{b.profiles?.phone_number}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-brand-ink">
                          {b.properties?.title || 'Archived Property'}
                        </div>
                        {b.properties && (
                          <div className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-brand-accent" />
                            <span>{b.properties.location}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-brand-ink">
                          <Calendar className="w-3.5 h-3.5 text-brand-accent" />
                          <span>{b.viewing_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-brand-muted mt-1">
                          <Clock className="w-3.5 h-3.5 text-brand-muted" />
                          <span>{b.viewing_time.slice(0, 5)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(b.status)}</td>

                      <td className="py-3 px-4 max-w-xs text-xs">
                        {b.client_notes && (
                          <p className="text-brand-ink truncate" title={b.client_notes}>
                            <span className="font-semibold">Client:</span> {b.client_notes}
                          </p>
                        )}
                        {b.admin_notes ? (
                          <p className="text-brand-accent truncate mt-0.5" title={b.admin_notes}>
                            <span className="font-semibold">Staff:</span> {b.admin_notes}
                          </p>
                        ) : (
                          <button
                            onClick={() => handleOpenNotes(b)}
                            className="text-[11px] text-brand-muted hover:text-brand-ink underline mt-0.5"
                          >
                            + Add staff note
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {b.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="h-8 px-2 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            <span>Confirm</span>
                          </Button>
                        )}

                        {b.status === 'confirmed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(b.id, 'completed')}
                            className="h-8 px-2 text-xs border-sky-300 text-sky-700 hover:bg-sky-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Complete</span>
                          </Button>
                        )}

                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="h-8 px-2 text-xs border-red-200 text-rose-600 hover:bg-rose-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenNotes(b)}
                          className="h-8 px-2 text-xs text-brand-muted hover:text-brand-ink"
                          title="Edit Admin Notes"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Staff Notes Dialog */}
      {editingNotesBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-brand-surface border-brand-border p-6 relative shadow-lg">
            <button
              onClick={() => setEditingNotesBooking(null)}
              className="absolute top-4 right-4 p-1 text-brand-muted hover:text-brand-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-brand-primary mb-1">
              Internal Staff Note
            </h3>
            <p className="text-xs text-brand-muted mb-4">
              Booking for {editingNotesBooking.properties?.title || 'Property'} &middot;{' '}
              {editingNotesBooking.viewing_date}
            </p>

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <textarea
                rows={3}
                placeholder="e.g. Key is with caretaker James; surveyor assigned."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full p-2.5 rounded-md border border-brand-border bg-white text-xs text-brand-ink resize-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingNotesBooking(null)}
                  disabled={savingNotes}
                  className="border-brand-border text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingNotes}
                  className="bg-brand-primary hover:bg-brand-primary-light text-white text-xs h-9 px-4"
                >
                  {savingNotes ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Note'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
