
DROP POLICY "products_admin_write" ON public.products;
CREATE POLICY "products_admin_write" ON public.products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

DROP POLICY "clients_rw" ON public.clients;
CREATE POLICY "clients_rw" ON public.clients FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
  WITH CHECK (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

DROP POLICY "proposals_owner_all" ON public.proposals;
CREATE POLICY "proposals_owner_all" ON public.proposals FOR ALL TO authenticated
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
  WITH CHECK (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

DROP POLICY "views_select_owner" ON public.proposal_views;
CREATE POLICY "views_select_owner" ON public.proposal_views FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')))
);

DROP POLICY "approvals_select_owner" ON public.proposal_approvals;
CREATE POLICY "approvals_select_owner" ON public.proposal_approvals FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.proposals p WHERE p.id = proposal_id AND (p.owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin')))
);

DROP POLICY "settings_admin_write" ON public.company_settings;
CREATE POLICY "settings_admin_write" ON public.company_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
