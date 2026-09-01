ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

GRANT UPDATE (status, first_viewed_at, last_viewed_at, approved_at, rejected_at, rejection_reason) ON public.proposals TO anon;
GRANT UPDATE (status, first_viewed_at, last_viewed_at, approved_at, rejected_at, rejection_reason) ON public.proposals TO authenticated;