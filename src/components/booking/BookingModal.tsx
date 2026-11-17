import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BookingModalProps {
  propertyId: string;
  propertyTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const HOURS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  propertyId,
  propertyTitle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Min date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!date) {
      setError('Please select a date.');
      return;
    }

    // Check if selected date is Sunday
    const parts = date.split('-');
    const pickedDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (pickedDate.getDay() === 0) {
      setError('Kiragu & Mwangi offices are closed on Sundays. Please select Mon-Sat.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('viewing_bookings').insert({
        property_id: propertyId,
        user_id: user.id,
        viewing_date: date,
        viewing_time: `${time}:00`,
        client_notes: notes.trim() || null,
        status: 'pending',
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This time slot is already booked for this property. Please choose another time.');
        } else {
          setError(insertError.message || 'Failed to book viewing.');
        }
        return;
      }

      toast.success('Viewing appointment requested successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md bg-brand-surface border-brand-border p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-brand-muted hover:text-brand-ink"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-serif font-bold text-brand-primary mb-1">
          Book a Viewing
        </h3>
        <p className="text-xs text-brand-muted mb-4 truncate">{propertyTitle}</p>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-ink">
              Date (Mon &ndash; Sat)
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError(null);
              }}
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-ink">Time</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-brand-border bg-white text-sm text-brand-ink"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-ink">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any questions or special requests"
              rows={2}
              className="w-full p-2.5 rounded-md border border-brand-border bg-white text-xs text-brand-ink resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-brand-border h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-primary-light text-white h-9 text-xs px-4"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </span>
              ) : (
                'Submit Booking'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
