CREATE TABLE public.proposal_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  template text NOT NULL DEFAULT 'consultiva',
  area_codes text[] NOT NULL DEFAULT ARRAY['ponto']::text[],
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  texts jsonb NOT NULL DEFAULT '{}'::jsonb,
  prices jsonb NOT NULL DEFAULT '{}'::jsonb,
  solution_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  solutions jsonb NOT NULL DEFAULT '[]'::jsonb,
  scenarios jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT proposal_templates_name_not_blank CHECK (length(btrim(name)) > 0),
  CONSTRAINT proposal_templates_owner_name_unique UNIQUE (owner_id, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_templates TO authenticated;
GRANT ALL ON public.proposal_templates TO service_role;

ALTER TABLE public.proposal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proposal templates"
ON public.proposal_templates FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can create own proposal templates"
ON public.proposal_templates FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own proposal templates"
ON public.proposal_templates FOR UPDATE TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete own proposal templates"
ON public.proposal_templates FOR DELETE TO authenticated
USING (owner_id = auth.uid());

CREATE TRIGGER proposal_templates_updated
BEFORE UPDATE ON public.proposal_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();