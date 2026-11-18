-- ==============================================================================
-- Kiragu & Mwangi Real Estate - Valuation Requests Status Constraint
-- Ensures that the check constraint supports all lifecycle states:
-- 'submitted' (default on creation), 'under_review', 'completed', and 'cancelled'
-- ==============================================================================

ALTER TABLE public.valuation_requests
  DROP CONSTRAINT IF EXISTS valuation_requests_status_check;

ALTER TABLE public.valuation_requests
  ADD CONSTRAINT valuation_requests_status_check
  CHECK (status IN ('submitted', 'under_review', 'completed', 'cancelled'));
