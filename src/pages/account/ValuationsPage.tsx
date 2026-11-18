import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AccountNav } from '@/components/account/AccountNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/lib/database.types';

type ValuationItem = Database['public']['Tables']['valuation_requests']['Row'];

export const ValuationsPage: React.FC = () => {
  const { user } = useAuth();
  const [valuations, setValuations] = useState<ValuationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'active' | 'cancelled' | 'all'>('active');

  const loadValuations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('valuation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setValuations(data);
    } catch (err: any) {
      console.error('Error fetching valuations:', err);
      toast.error('Could not load valuation requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadValuations();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this valuation request?')) return;
    setCancellingId(id);
    try {
      // 1. Try secure RPC function
      const { data: rpcSuccess, error: rpcError } = await supabase.rpc(
        'cancel_my_valuation_request',
        {
          request_id: id,
        }
      );

      if (rpcError || !rpcSuccess) {
        // 2. Fallback to direct update using RLS policy
        const { data: updatedRows, error: updateError } = await supabase
          .from('valuation_requests')
          .update({ status: 'cancelled' })
          .eq('id', id)
          .select('id, status');

        if (updateError) throw updateError;

        if (!updatedRows || updatedRows.length === 0) {
          throw new Error(
            'Unable to cancel valuation in the database. Please execute the migration SQL in your Supabase SQL editor.'
          );
        }
      }

      toast.success('Valuation request cancelled.');
      setValuations((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'cancelled' } : v))
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'under_review':
      case 'in_review':
        return <Badge variant="rescheduled">Under Review</Badge>;
      case 'completed':
        return <Badge variant="confirmed">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'submitted':
      case 'pending':
      default:
        return <Badge variant="pending">Submitted</Badge>;
    }
  };

  const activeValuationsCount = valuations.filter(
    (v) =>
      v.status === 'submitted' ||
      v.status === 'under_review' ||
      v.status === 'pending' ||
      v.status === 'in_review'
  ).length;

  const cancelledValuationsCount = valuations.filter(
    (v) => v.status === 'cancelled' || v.status === 'closed'
  ).length;

  const filteredValuations = valuations.filter((v) => {
    if (filterTab === 'active') {
      return (
        v.status === 'submitted' ||
        v.status === 'under_review' ||
        v.status === 'pending' ||
        v.status === 'in_review'
      );
    }
    if (filterTab === 'cancelled') {
      return v.status === 'cancelled' || v.status === 'closed';
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
            My Valuation Requests
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Review appraisal requests submitted for your properties.
          </p>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary-light">
          <Link to="/valuation/new" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </Button>
      </div>

      <AccountNav />

      {valuations.length > 0 && (
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterTab === 'active'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-ink hover:bg-brand-background'
            }`}
          >
            Active ({activeValuationsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('cancelled')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterTab === 'cancelled'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-ink hover:bg-brand-background'
            }`}
          >
            Cancelled ({cancelledValuationsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterTab === 'all'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-brand-muted hover:text-brand-ink hover:bg-brand-background'
            }`}
          >
            All ({valuations.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-brand-surface rounded-lg border border-brand-border animate-pulse" />
          ))}
        </div>
      ) : filteredValuations.length === 0 ? (
        <Card className="p-8 text-center border-brand-border bg-brand-surface space-y-3">
          <p className="text-sm text-brand-muted">
            {filterTab === 'active'
              ? 'You have no active valuation requests.'
              : filterTab === 'cancelled'
              ? 'No cancelled valuation requests.'
              : 'You have no valuation requests.'}
          </p>
          <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-primary-light">
            <Link to="/valuation/new">Request a Valuation</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredValuations.map((v) => {
            const canCancel = v.status === 'submitted' || v.status === 'pending';
            return (
              <Card
                key={v.id}
                className="p-5 border-brand-border bg-brand-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(v.status)}
                    <span className="text-xs text-brand-muted">
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-mono text-brand-muted">
                      #{v.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-brand-primary flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-accent flex-shrink-0" />
                    <span>{v.location}</span>
                  </h3>

                  <p className="text-xs text-brand-muted capitalize">
                    {v.property_category} &middot; Purpose: {v.purpose.replace('_', ' ')}
                    {v.lr_number && ` · LR ${v.lr_number}`}
                    {v.approximate_size && ` · ${v.approximate_size}`}
                  </p>
                </div>

                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === v.id}
                    onClick={() => handleCancel(v.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                  >
                    {cancellingId === v.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Cancel'
                    )}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
