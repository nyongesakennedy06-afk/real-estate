import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Mail,
  Phone,
  UserCheck,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface ValuationRow {
  id: string;
  user_id: string;
  property_category: string;
  location: string;
  lr_number: string | null;
  approximate_size: string | null;
  purpose: string;
  additional_details: string | null;
  status: string;
  handled_by: string | null;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string | null;
  } | null;
  surveyor?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
}

export const AdminValuationsPage: React.FC = () => {
  const [valuations, setValuations] = useState<ValuationRow[]>([]);
  const [surveyors, setSurveyors] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Assign Surveyor Dialog
  const [assigningValuation, setAssigningValuation] = useState<ValuationRow | null>(null);
  const [selectedSurveyorId, setSelectedSurveyorId] = useState<string>('');
  const [savingAssignee, setSavingAssignee] = useState(false);

  const loadValuations = async () => {
    try {
      const { data, error } = await supabase
        .from('valuation_requests')
        .select(`
          id,
          user_id,
          property_category,
          location,
          lr_number,
          approximate_size,
          purpose,
          additional_details,
          status,
          handled_by,
          created_at,
          profiles:user_id (id, full_name, email, phone_number),
          surveyor:handled_by (id, full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setValuations(data as unknown as ValuationRow[]);
    } catch (err: any) {
      console.error('Error fetching valuations:', err);
      toast.error('Could not load valuation requests.');
    } finally {
      setLoading(false);
    }
  };

  const loadSurveyors = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'admin');

      if (data) setSurveyors(data);
    } catch (err) {
      console.error('Error fetching admin surveyors:', err);
    }
  };

  useEffect(() => {
    loadValuations();
    loadSurveyors();

    const channel = supabase
      .channel('admin_valuations_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'valuation_requests' },
        () => {
          loadValuations();
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
        .from('valuation_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Status updated to ${newStatus}.`);
      setValuations((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const handleOpenAssign = (val: ValuationRow) => {
    setAssigningValuation(val);
    setSelectedSurveyorId(val.handled_by || '');
  };

  const handleSaveAssignee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningValuation) return;

    setSavingAssignee(true);
    try {
      const targetValId = assigningValuation.id;
      const newHandledBy = selectedSurveyorId || null;

      const { error } = await supabase
        .from('valuation_requests')
        .update({
          handled_by: newHandledBy,
          // If unreviewed, automatically advance to 'in_review' when assigned
          status:
            assigningValuation.status === 'pending' && newHandledBy
              ? 'in_review'
              : assigningValuation.status,
        })
        .eq('id', targetValId);

      if (error) throw error;

      toast.success('Appraisal surveyor assigned.');
      setAssigningValuation(null);
      loadValuations();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign surveyor.');
    } finally {
      setSavingAssignee(false);
    }
  };

  const filteredValuations = valuations.filter((v) => {
    const clientName = v.profiles?.full_name?.toLowerCase() || '';
    const location = v.location.toLowerCase();
    const lr = v.lr_number?.toLowerCase() || '';
    const q = search.toLowerCase();

    const matchesSearch = clientName.includes(q) || location.includes(q) || lr.includes(q);
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_review':
        return <Badge variant="rescheduled">In Review</Badge>;
      case 'completed':
        return <Badge variant="confirmed">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge variant="pending">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
          Valuation Requests
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Review submitted parcels, assign appraisers, and manage valuation job statuses.
        </p>
      </div>

      <Card className="border-brand-border bg-brand-surface">
        <CardHeader className="p-4 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by client, LR, or location..."
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
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Badge variant="outline" className="text-xs">
              Total: {filteredValuations.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-background border-b border-brand-border text-xs uppercase font-semibold text-brand-muted">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Parcel / Location</th>
                  <th className="py-3 px-4">Category &amp; Size</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-brand-muted">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-muted mb-2" />
                      Loading valuations...
                    </td>
                  </tr>
                ) : filteredValuations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-brand-muted">
                      No matching valuation requests found.
                    </td>
                  </tr>
                ) : (
                  filteredValuations.map((v) => (
                    <tr key={v.id} className="hover:bg-brand-background/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-brand-primary">
                          {v.profiles?.full_name || 'Client'}
                        </div>
                        <div className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-brand-muted" />
                          <span>{v.profiles?.email}</span>
                        </div>
                        {v.profiles?.phone_number && (
                          <div className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-brand-muted" />
                            <span>{v.profiles?.phone_number}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-brand-ink flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
                          <span>{v.location}</span>
                        </div>
                        {v.lr_number && (
                          <div className="text-xs text-brand-muted font-mono mt-0.5">
                            LR {v.lr_number}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs capitalize">
                        <div>{v.property_category}</div>
                        {v.approximate_size && (
                          <div className="text-brand-muted mt-0.5">{v.approximate_size}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs capitalize font-medium text-brand-ink">
                        {v.purpose.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-4 text-xs">
                        {v.surveyor ? (
                          <button
                            onClick={() => handleOpenAssign(v)}
                            className="font-medium text-brand-primary hover:text-brand-accent flex items-center gap-1 underline"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{v.surveyor.full_name}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenAssign(v)}
                            className="text-brand-muted hover:text-brand-ink text-xs underline"
                          >
                            + Assign Surveyor
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(v.status)}</td>

                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <select
                          value={v.status}
                          onChange={(e) => handleUpdateStatus(v.id, e.target.value)}
                          className="h-8 px-2 text-xs border border-brand-border rounded bg-white text-brand-ink focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_review">In Review</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Surveyor Dialog */}
      {assigningValuation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-brand-surface border-brand-border p-6 relative shadow-lg">
            <button
              onClick={() => setAssigningValuation(null)}
              className="absolute top-4 right-4 p-1 text-brand-muted hover:text-brand-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-brand-primary mb-1">
              Assign Surveyor / Appraiser
            </h3>
            <p className="text-xs text-brand-muted mb-4 truncate">
              {assigningValuation.location} {assigningValuation.lr_number ? `(${assigningValuation.lr_number})` : ''}
            </p>

            <form onSubmit={handleSaveAssignee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">
                  Select Registered Appraiser
                </label>
                <select
                  value={selectedSurveyorId}
                  onChange={(e) => setSelectedSurveyorId(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                >
                  <option value="">Unassigned</option>
                  {surveyors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssigningValuation(null)}
                  disabled={savingAssignee}
                  className="border-brand-border text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingAssignee}
                  className="bg-brand-primary hover:bg-brand-primary-light text-white text-xs h-9 px-4"
                >
                  {savingAssignee ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Assignment'
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
