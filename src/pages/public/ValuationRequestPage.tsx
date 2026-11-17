import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ValuationRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState('residential');
  const [location, setLocation] = useState('');
  const [lrNumber, setLrNumber] = useState('');
  const [size, setSize] = useState('');
  const [purpose, setPurpose] = useState('mortgage');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?returnUrl=/valuation/new');
      return;
    }

    if (!location.trim()) {
      setError('Please provide the property location.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('valuation_requests').insert({
        user_id: user.id,
        property_category: category,
        location: location.trim(),
        lr_number: lrNumber.trim() || null,
        approximate_size: size.trim() || null,
        purpose: purpose,
        additional_details: details.trim() || null,
        status: 'pending',
      });

      if (insertError) throw insertError;

      toast.success('Valuation request submitted successfully!');
      navigate('/account/valuations');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit valuation request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-primary">
          Request a Property Valuation
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Submit property details for formal appraisal by our licensed surveyors.
        </p>
      </div>

      {!user ? (
        <Card className="p-6 border-brand-border bg-brand-surface space-y-4">
          <p className="text-sm text-brand-ink">
            Please sign in to submit a valuation request and track its progress online.
          </p>
          <Button asChild className="bg-brand-primary hover:bg-brand-primary-light">
            <Link to="/login?returnUrl=/valuation/new">Sign In / Register</Link>
          </Button>
        </Card>
      ) : (
        <Card className="border-brand-border bg-brand-surface shadow-sm">
          <CardHeader className="border-b border-brand-border pb-4">
            <CardTitle className="text-lg font-serif">Property Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">
                    Property Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="agricultural">Agricultural</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">
                    Purpose of Valuation *
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  >
                    <option value="mortgage">Mortgage / Bank Financing</option>
                    <option value="sale">Sale / Disposal</option>
                    <option value="insurance">Insurance Replacement</option>
                    <option value="book_value">Book Value / Audit</option>
                    <option value="taxation">Taxation / Stamp Duty</option>
                    <option value="litigation">Litigation / Dispute</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">
                  Location / Physical Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riverside Drive, Westlands, Nairobi"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">
                    Land Reference (LR) Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LR 209/12345 (Optional)"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-ink">
                    Approximate Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 0.5 acre, 3500 sq ft (Optional)"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-ink">
                  Additional Details / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe building type, current occupancy, or any special requests"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-2.5 rounded-md border border-brand-border bg-white text-xs text-brand-ink resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-brand-primary hover:bg-brand-primary-light text-white font-medium text-sm"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    'Submit Valuation Request'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
