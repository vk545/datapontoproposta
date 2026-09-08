ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS area_codes text[] NOT NULL DEFAULT ARRAY['ponto']::text[];

ALTER TABLE public.proposal_products
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS image_url text;