CREATE TABLE public.solution_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'boxes',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.solution_areas TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_areas TO authenticated;
GRANT ALL ON public.solution_areas TO service_role;
ALTER TABLE public.solution_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY areas_read ON public.solution_areas FOR SELECT USING (true);
CREATE POLICY areas_admin_write ON public.solution_areas FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role));

CREATE TABLE public.solution_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid NOT NULL REFERENCES public.solution_areas(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.solution_subcategories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_subcategories TO authenticated;
GRANT ALL ON public.solution_subcategories TO service_role;
ALTER TABLE public.solution_subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY subcats_read ON public.solution_subcategories FOR SELECT USING (true);
CREATE POLICY subcats_admin_write ON public.solution_subcategories FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role));

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.solution_areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.solution_subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS highlight text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tech_note text NOT NULL DEFAULT '';

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS rejection_note text DEFAULT '';

CREATE TABLE public.proposal_solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  area_id uuid REFERENCES public.solution_areas(id) ON DELETE SET NULL,
  area_code text NOT NULL DEFAULT '',
  why_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.proposal_solutions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_solutions TO authenticated;
GRANT ALL ON public.proposal_solutions TO service_role;
ALTER TABLE public.proposal_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY psol_public_read ON public.proposal_solutions FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.status <> 'rascunho'));
CREATE POLICY psol_owner_all ON public.proposal_solutions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))));

CREATE TABLE public.proposal_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  area_code text NOT NULL DEFAULT '',
  scenario text NOT NULL DEFAULT 'recomendada',
  name text NOT NULL DEFAULT '',
  billing text NOT NULL DEFAULT 'monthly',
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.proposal_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_products TO authenticated;
GRANT ALL ON public.proposal_products TO service_role;
ALTER TABLE public.proposal_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY pprod_public_read ON public.proposal_products FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.status <> 'rascunho'));
CREATE POLICY pprod_owner_all ON public.proposal_products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))));

CREATE TABLE public.proposal_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  key text NOT NULL DEFAULT 'recomendada',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  monthly_total numeric NOT NULL DEFAULT 0,
  upfront_total numeric NOT NULL DEFAULT 0,
  recommended boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, key)
);
GRANT SELECT ON public.proposal_scenarios TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_scenarios TO authenticated;
GRANT ALL ON public.proposal_scenarios TO service_role;
ALTER TABLE public.proposal_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY pscen_public_read ON public.proposal_scenarios FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND p.status <> 'rascunho'));
CREATE POLICY pscen_owner_all ON public.proposal_scenarios FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'::app_role))));

CREATE TRIGGER solution_areas_updated BEFORE UPDATE ON public.solution_areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER solution_subcategories_updated BEFORE UPDATE ON public.solution_subcategories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER proposal_solutions_updated BEFORE UPDATE ON public.proposal_solutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER proposal_products_updated BEFORE UPDATE ON public.proposal_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER proposal_scenarios_updated BEFORE UPDATE ON public.proposal_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();