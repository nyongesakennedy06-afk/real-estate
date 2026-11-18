-- ==============================================================================
-- Kiragu & Mwangi Real Estate - User Cancellation Policies & Functions (Point 2)
-- Enables regular authenticated users to cancel their own viewing bookings
-- and valuation requests safely, respecting RLS and status constraints.
-- ==============================================================================

-- 1. VIEWING BOOKINGS CANCELLATION
-- The PRD lifecycle is: pending -> confirmed | rescheduled -> closed

-- 1.1 RLS Update Policy: allow user to close their own active booking
DROP POLICY IF EXISTS "viewing_bookings_user_cancel" ON public.viewing_bookings;
CREATE POLICY "viewing_bookings_user_cancel" ON public.viewing_bookings
FOR UPDATE USING (
  auth.uid() = user_id AND status IN ('pending', 'confirmed', 'rescheduled')
) WITH CHECK (
  auth.uid() = user_id AND status = 'closed'
);

-- 1.2 RPC Function: secure cancellation endpoint
CREATE OR REPLACE FUNCTION public.cancel_my_viewing_booking(booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.viewing_bookings
  SET status = 'closed', updated_at = now()
  WHERE id = booking_id
    AND user_id = auth.uid()
    AND status IN ('pending', 'confirmed', 'rescheduled');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found or cannot be cancelled.';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_my_viewing_booking(uuid) TO authenticated;


-- 2. VALUATION REQUESTS CANCELLATION
-- Ensure check constraint includes 'cancelled'
ALTER TABLE public.valuation_requests
  DROP CONSTRAINT IF EXISTS valuation_requests_status_check;

ALTER TABLE public.valuation_requests
  ADD CONSTRAINT valuation_requests_status_check
  CHECK (status IN ('submitted', 'under_review', 'completed', 'cancelled'));

-- 2.1 RLS Update Policy: allow user to cancel their own submitted request
DROP POLICY IF EXISTS "valuation_requests_user_cancel" ON public.valuation_requests;
CREATE POLICY "valuation_requests_user_cancel" ON public.valuation_requests
FOR UPDATE USING (
  auth.uid() = user_id AND status = 'submitted'
) WITH CHECK (
  auth.uid() = user_id AND status = 'cancelled'
);

-- 2.2 RPC Function: secure valuation cancellation endpoint
CREATE OR REPLACE FUNCTION public.cancel_my_valuation_request(request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.valuation_requests
  SET status = 'cancelled', updated_at = now()
  WHERE id = request_id
    AND user_id = auth.uid()
    AND status = 'submitted';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Valuation request not found or cannot be cancelled.';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_my_valuation_request(uuid) TO authenticated;
