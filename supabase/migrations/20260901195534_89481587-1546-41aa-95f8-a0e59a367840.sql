
CREATE TYPE public.app_role AS ENUM ('admin','seller');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  whatsapp text DEFAULT '',
  role_title text DEFAULT '',
  photo_url text,
  signature text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), COALESCE(NEW.email,''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'equipment',
  billing text NOT NULL DEFAULT 'monthly',
  description text NOT NULL DEFAULT '',
  default_price numeric NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  main_image_url text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_read_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  company_name text NOT NULL,
  cnpj text DEFAULT '',
  contact_name text DEFAULT '',
  contact_role text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  employees int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_rw" ON public.clients FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  public_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12),'hex'),
  number serial,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  company_name text NOT NULL DEFAULT '',
  cnpj text DEFAULT '',
  contact_name text DEFAULT '',
  contact_role text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  employees int DEFAULT 0,
  need_key text DEFAULT '',
  problem_text text DEFAULT '',
  template text NOT NULL DEFAULT 'consultiva',
  modality text NOT NULL DEFAULT 'primme',
  system_plan text NOT NULL DEFAULT 'pro',
  licenses int NOT NULL DEFAULT 10,
  device_qty int NOT NULL DEFAULT 1,
  prices jsonb NOT NULL DEFAULT '{}'::jsonb,
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  texts jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculator jsonb NOT NULL DEFAULT '{}'::jsonb,
  discount_reason text DEFAULT '',
  monthly_total numeric NOT NULL DEFAULT 0,
  upfront_total numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'rascunho',
  valid_until date,
  notes text DEFAULT '',
  seller_name text DEFAULT '',
  seller_email text DEFAULT '',
  seller_phone text DEFAULT '',
  sent_at timestamptz,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT SELECT, UPDATE ON public.proposals TO anon;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "proposals_owner_all" ON public.proposals FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "proposals_public_read" ON public.proposals FOR SELECT TO anon USING (status <> 'rascunho');
CREATE TRIGGER proposals_updated BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.proposal_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.proposal_views TO authenticated, anon;
GRANT ALL ON public.proposal_views TO service_role;
ALTER TABLE public.proposal_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "views_insert_any" ON public.proposal_views FOR INSERT WITH CHECK (true);
CREATE POLICY "views_select_owner" ON public.proposal_views FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

CREATE TABLE public.proposal_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  name text NOT NULL,
  role_title text DEFAULT '',
  email text DEFAULT '',
  approved_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.proposal_approvals TO authenticated, anon;
GRANT ALL ON public.proposal_approvals TO service_role;
ALTER TABLE public.proposal_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals_insert_any" ON public.proposal_approvals FOR INSERT WITH CHECK (true);
CREATE POLICY "approvals_select_owner" ON public.proposal_approvals FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid() OR public.has_role(auth.uid(),'admin')))
);

CREATE TABLE public.company_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  company_name text NOT NULL DEFAULT 'Dataponto',
  logo_url text,
  phone text DEFAULT '',
  whatsapp text DEFAULT '',
  email text DEFAULT '',
  site text DEFAULT '',
  address text DEFAULT '',
  color_primary text NOT NULL DEFAULT '#16A34A',
  color_institutional text NOT NULL DEFAULT '#403D62',
  footer text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.company_settings TO authenticated;
GRANT SELECT ON public.company_settings TO anon;
GRANT ALL ON public.company_settings TO service_role;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_read" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON public.company_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.company_settings (id) VALUES (true);

INSERT INTO public.products (code,name,kind,billing,description,default_price,features,benefits,sort_order) VALUES
('relogio_facial','Relógio de Ponto Facial','equipment','onetime','Registro de ponto por reconhecimento facial, com operação offline, tela touch e comprovante digital.',1020,
 '["Reconhecimento facial","Até 5.000 faces","Operação offline","Wi-Fi","Tela touch","Câmera","Baixa necessidade de manutenção","Comprovante digital por e-mail"]'::jsonb,
 '["Cada colaborador registra o próprio ponto por meio da identificação facial, reduzindo significativamente a possibilidade de registros realizados por terceiros.","O equipamento continua registrando mesmo sem depender de conexão constante.","O comprovante digital reduz a necessidade de utilização de papel."]'::jsonb,1),
('primme','Primme','service','monthly','Modalidade que reúne equipamento, manutenção, peças, mão de obra, suporte e treinamento em uma mensalidade.',58,
 '["Equipamento incluso","Suporte","Treinamento","Mão de obra","Peças","Manutenção","Visitas na Grande São Paulo","Assistência"]'::jsonb,
 '["Sem multa de fidelidade","Cancelamento antes de 12 meses: devolução do equipamento","Após 12 meses: permanência com o equipamento conforme condições contratuais"]'::jsonb,2),
('secullum_pro','Secullum RH Pro','system','monthly','Gestão de ponto pelo navegador, com relatórios, registro mobile e aplicativo do colaborador.',73,
 '["Acesso via navegador","Relatórios","Registro de ponto pelo celular","Geolocalização","Foto no registro","Aplicativo para colaboradores","Mínimo de 10 colaboradores"]'::jsonb,'[]'::jsonb,3),
('secullum_ultimate','Secullum RH Ultimate','system','monthly','Todos os recursos do Pro somados a gestão de férias, arquivos, auditoria por IA e dashboards adicionais.',86,
 '["Todos os recursos do Pro","Gestão de férias","Gestão de arquivos","Auditoria por IA","Dashboards adicionais","Celular ou tablet como relógio de ponto universal"]'::jsonb,'[]'::jsonb,4);
