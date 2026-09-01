
REVOKE UPDATE ON public.proposals FROM anon;
GRANT UPDATE (first_viewed_at, last_viewed_at, approved_at, status) ON public.proposals TO anon;
CREATE POLICY "proposals_public_track" ON public.proposals FOR UPDATE TO anon
  USING (status <> 'rascunho') WITH CHECK (status <> 'rascunho');
