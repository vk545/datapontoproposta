import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Settings = {
  id: boolean;
  company_name: string;
  logo_url: string | null;
  phone: string;
  whatsapp: string;
  email: string;
  site: string;
  address: string;
  color_primary: string;
  color_institutional: string;
  footer: string;
};

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Dataponto Propostas" },
      {
        name: "description",
        content: "Dados institucionais, cores da marca e informações do consultor responsável.",
      },
      { property: "og:title", content: "Configurações — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Dados institucionais, cores da marca e informações do consultor.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <SettingsPage />
    </AppShell>
  ),
});

function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [profile, setProfile] = useState({ name: "", phone: "", whatsapp: "", role_title: "" });

  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("company_settings").select("*").maybeSingle();
      if (error) throw error;
      return data as unknown as Settings | null;
    },
  });

  useEffect(() => {
    if (data) setSettings(data);
  }, [data]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("name,phone,whatsapp,role_title")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data as typeof profile);
      });
  }, [user]);

  async function saveSettings() {
    if (!settings) return;
    const { error } = await supabase
      .from("company_settings")
      .update(settings as never)
      .eq("id", true);
    if (error) return toast.error("Somente administradores podem alterar as configurações.");
    toast.success("Configurações salvas.");
  }

  async function saveProfile() {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update(profile as never)
      .eq("id", user.id);
    if (error) return toast.error("Não foi possível salvar seus dados.");
    toast.success("Dados do consultor salvos.");
  }

  return (
    <>
      <PageHeader title="Configurações" description="Identidade da empresa e dados do consultor." />
      <div className="grid max-w-5xl gap-6 p-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-7 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Empresa
          </h2>
          {settings ? (
            <div className="mt-5 space-y-4">
              {(
                [
                  ["company_name", "Nome"],
                  ["phone", "Telefone"],
                  ["whatsapp", "WhatsApp"],
                  ["email", "E-mail"],
                  ["site", "Site"],
                  ["address", "Endereço"],
                  ["logo_url", "Logo (URL)"],
                ] as const
              ).map(([k, l]) => (
                <div key={k}>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    {l}
                  </Label>
                  <Input
                    className="mt-1.5"
                    value={(settings[k] as string) ?? ""}
                    onChange={(e) => setSettings({ ...settings, [k]: e.target.value })}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Verde Dataponto
                  </Label>
                  <Input
                    className="mt-1.5"
                    value={settings.color_primary}
                    onChange={(e) => setSettings({ ...settings, color_primary: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Roxo Dataponto
                  </Label>
                  <Input
                    className="mt-1.5"
                    value={settings.color_institutional}
                    onChange={(e) =>
                      setSettings({ ...settings, color_institutional: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Rodapé
                </Label>
                <Textarea
                  rows={2}
                  className="mt-1.5"
                  value={settings.footer ?? ""}
                  onChange={(e) => setSettings({ ...settings, footer: e.target.value })}
                />
              </div>
              <Button onClick={saveSettings}>Salvar</Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-7 shadow-soft">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Consultor
          </h2>
          <div className="mt-5 space-y-4">
            {(
              [
                ["name", "Nome"],
                ["role_title", "Cargo"],
                ["phone", "Telefone"],
                ["whatsapp", "WhatsApp"],
              ] as const
            ).map(([k, l]) => (
              <div key={k}>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                  {l}
                </Label>
                <Input
                  className="mt-1.5"
                  value={profile[k] ?? ""}
                  onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}
                />
              </div>
            ))}
            <Button onClick={saveProfile}>Salvar</Button>
          </div>
        </div>
      </div>
    </>
  );
}
