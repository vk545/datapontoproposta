import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Presentation, Save, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { ProposalDocument } from "@/components/proposal/ProposalDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NEED_OPTIONS,
  SECTION_LABELS,
  SECTION_ORDER,
  STATUSES,
  STATUS_LABEL,
  calcInvestment,
  currency,
  type SectionKey,
} from "@/lib/dataponto";
import { narrativeOf, pricesOf, sectionsOf, type Proposal } from "@/lib/proposal";

export const Route = createFileRoute("/propostas/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar proposta — Dataponto Propostas" },
      {
        name: "description",
        content: "Ajuste narrativa, solução, seções e investimento antes de enviar ao cliente.",
      },
      { property: "og:title", content: "Editar proposta — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Ajuste narrativa, solução, seções e investimento antes de enviar ao cliente.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Editor />
    </AppShell>
  ),
});

function Editor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Proposal | null>(null);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals").select("*").eq("id", id).single();
      if (error) throw error;
      return data as unknown as Proposal;
    },
  });

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  if (!draft) {
    return <p className="p-8 text-sm text-muted-foreground">Carregando proposta…</p>;
  }

  const prices = pricesOf(draft);
  const sections = sectionsOf(draft);
  const inv = calcInvestment({
    modality: draft.modality,
    plan: draft.system_plan,
    deviceQty: draft.device_qty,
    prices,
  });
  const set = (patch: Partial<Proposal>) => setDraft({ ...draft, ...patch });

  async function save(extra: Partial<Proposal> = {}) {
    if (!draft) return;
    setSaving(true);
    const payload = {
      ...draft,
      ...extra,
      prices,
      sections,
      monthly_total: inv.monthly,
      upfront_total: inv.upfront,
      valid_until: draft.valid_until || null,
    };
    const { error } = await supabase
      .from("proposals")
      .update(payload as never)
      .eq("id", draft.id);
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar.");
      return;
    }
    setDraft(payload as Proposal);
    toast.success("Proposta salva.");
  }

  async function publish() {
    await save({ status: "enviada", sent_at: new Date().toISOString() });
    const url = `${window.location.origin}/p/${draft!.public_token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link gerado e copiado.");
  }

  async function remove() {
    await supabase.from("proposals").delete().eq("id", id);
    navigate({ to: "/propostas" });
  }

  return (
    <>
      <PageHeader
        title={draft.company_name || "Proposta"}
        description={`Proposta ${draft.number ? `#${draft.number}` : ""} · ${currency(inv.monthly)}/mês`}
        actions={
          <>
            <StatusBadge status={draft.status} />
            <Button variant="outline" asChild>
              <Link to="/propostas/$id/apresentar" params={{ id }}>
                <Presentation className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
                Apresentar
              </Link>
            </Button>
            <Button variant="outline" onClick={publish}>
              <Share2 className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
              Publicar e copiar link
            </Button>
            <Button onClick={() => save()} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
              Salvar
            </Button>
          </>
        }
      />

      <div className="p-8">
        <Tabs defaultValue="dados">
          <TabsList>
            <TabsTrigger value="dados">Cliente</TabsTrigger>
            <TabsTrigger value="solucao">Solução e preços</TabsTrigger>
            <TabsTrigger value="secoes">Seções e textos</TabsTrigger>
            <TabsTrigger value="raiox">Raio-X</TabsTrigger>
            <TabsTrigger value="preview">Pré-visualizar</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6">
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Empresa" full>
                  <Input
                    value={draft.company_name}
                    onChange={(e) => set({ company_name: e.target.value })}
                  />
                </F>
                <F label="CNPJ">
                  <Input value={draft.cnpj ?? ""} onChange={(e) => set({ cnpj: e.target.value })} />
                </F>
                <F label="Responsável">
                  <Input
                    value={draft.contact_name ?? ""}
                    onChange={(e) => set({ contact_name: e.target.value })}
                  />
                </F>
                <F label="Cargo">
                  <Input
                    value={draft.contact_role ?? ""}
                    onChange={(e) => set({ contact_role: e.target.value })}
                  />
                </F>
                <F label="Telefone">
                  <Input
                    value={draft.phone ?? ""}
                    onChange={(e) => set({ phone: e.target.value })}
                  />
                </F>
                <F label="E-mail">
                  <Input
                    value={draft.email ?? ""}
                    onChange={(e) => set({ email: e.target.value })}
                  />
                </F>
                <F label="Cidade">
                  <Input value={draft.city ?? ""} onChange={(e) => set({ city: e.target.value })} />
                </F>
                <F label="Estado">
                  <Input
                    value={draft.state ?? ""}
                    onChange={(e) => set({ state: e.target.value })}
                  />
                </F>
                <F label="Colaboradores">
                  <Input
                    type="number"
                    value={String(draft.employees ?? 0)}
                    onChange={(e) => set({ employees: Number(e.target.value) })}
                  />
                </F>
                <F label="Validade">
                  <Input
                    type="date"
                    value={draft.valid_until ?? ""}
                    onChange={(e) => set({ valid_until: e.target.value })}
                  />
                </F>
                <F label="Status">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.status}
                    onChange={(e) => set({ status: e.target.value })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </F>
                <F label="Necessidade principal" full>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.need_key ?? "outro"}
                    onChange={(e) => set({ need_key: e.target.value })}
                  >
                    {NEED_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </F>
                <F label="Problema relatado" full>
                  <Textarea
                    rows={3}
                    value={draft.problem_text ?? ""}
                    onChange={(e) => set({ problem_text: e.target.value })}
                  />
                </F>
                <F label="Consultor">
                  <Input
                    value={draft.seller_name ?? ""}
                    onChange={(e) => set({ seller_name: e.target.value })}
                  />
                </F>
                <F label="Telefone do consultor">
                  <Input
                    value={draft.seller_phone ?? ""}
                    onChange={(e) => set({ seller_phone: e.target.value })}
                  />
                </F>
                <F label="E-mail do consultor" full>
                  <Input
                    value={draft.seller_email ?? ""}
                    onChange={(e) => set({ seller_email: e.target.value })}
                  />
                </F>
              </div>
              <div className="mt-6 border-t border-border pt-4">
                <Button variant="ghost" className="text-destructive" onClick={remove}>
                  <Trash2 className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
                  Excluir proposta
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="solucao" className="mt-6">
            <Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Modalidade">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.modality}
                    onChange={(e) => set({ modality: e.target.value as "primme" | "compra" })}
                  >
                    <option value="primme">Primme</option>
                    <option value="compra">Compra</option>
                  </select>
                </F>
                <F label="Sistema">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.system_plan}
                    onChange={(e) =>
                      set({ system_plan: e.target.value as "pro" | "ultimate" | "nenhum" })
                    }
                  >
                    <option value="pro">Secullum RH Pro</option>
                    <option value="ultimate">Secullum RH Ultimate</option>
                    <option value="nenhum">Sem sistema</option>
                  </select>
                </F>
                <F label="Equipamentos">
                  <Input
                    type="number"
                    min={1}
                    value={String(draft.device_qty)}
                    onChange={(e) => set({ device_qty: Number(e.target.value) })}
                  />
                </F>
                <F label="Licenças">
                  <Input
                    type="number"
                    value={String(draft.licenses)}
                    onChange={(e) => set({ licenses: Number(e.target.value) })}
                  />
                </F>
              </div>

              <p className="mt-8 text-sm font-semibold">Preços aplicados</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-4">
                {(
                  [
                    ["equipment", "Equipamento"],
                    ["primme", "Primme/mês"],
                    ["pro", "Pro/mês"],
                    ["ultimate", "Ultimate/mês"],
                  ] as const
                ).map(([k, l]) => (
                  <F key={k} label={l}>
                    <Input
                      type="number"
                      value={String(prices[k])}
                      onChange={(e) =>
                        set({ prices: { ...prices, [k]: Number(e.target.value) } })
                      }
                    />
                  </F>
                ))}
              </div>
              <F label="Motivo da condição comercial (interno)">
                <Input
                  className="mt-1.5"
                  value={draft.discount_reason ?? ""}
                  onChange={(e) => set({ discount_reason: e.target.value })}
                />
              </F>

              <div className="mt-8 rounded-xl border border-brand/30 bg-brand-soft p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Total mensal
                </p>
                <p className="text-3xl font-semibold text-institutional">
                  {currency(inv.monthly)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Investimento inicial: {currency(inv.upfront)}
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="secoes" className="mt-6">
            <Card>
              <p className="text-sm font-semibold">Módulos ativáveis</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {SECTION_ORDER.map((k: SectionKey) => (
                  <label
                    key={k}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--brand)]"
                      checked={sections[k]}
                      onChange={(e) => set({ sections: { ...sections, [k]: e.target.checked } })}
                    />
                    {SECTION_LABELS[k]}
                  </label>
                ))}
              </div>
              <p className="mt-8 text-sm font-semibold">Textos da capa</p>
              <div className="mt-3 grid gap-4">
                <F label="Título da capa">
                  <Input
                    value={draft.texts?.['cover_title'] ?? ""}
                    placeholder="Controle de ponto pensado para a sua operação."
                    onChange={(e) =>
                      set({ texts: { ...(draft.texts ?? {}), cover_title: e.target.value } })
                    }
                  />
                </F>
                <F label="Subtítulo da capa">
                  <Input
                    value={draft.texts?.['cover_subtitle'] ?? ""}
                    placeholder={narrativeOf(draft).subtitle}
                    onChange={(e) =>
                      set({ texts: { ...(draft.texts ?? {}), cover_subtitle: e.target.value } })
                    }
                  />
                </F>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="raiox" className="mt-6">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Raio-X da proposta
              </p>
              <dl className="mt-5 divide-y divide-border">
                {[
                  ["Problema identificado", narrativeOf(draft).label],
                  ["Cenário relatado", draft.problem_text || "—"],
                  ["Impacto", "Tempo, retrabalho e custo operacional acumulados"],
                  ["Solução", `Relógio de ponto facial · ${draft.device_qty} equipamento(s)`],
                  ["Proteção", draft.modality === "primme" ? "Primme" : "Compra"],
                  [
                    "Gestão",
                    draft.system_plan === "nenhum"
                      ? "Sem sistema"
                      : `Secullum RH ${draft.system_plan === "pro" ? "Pro" : "Ultimate"}`,
                  ],
                  [
                    "Investimento",
                    `${currency(inv.monthly)}/mês${inv.upfront ? ` + ${currency(inv.upfront)}` : ""}`,
                  ],
                  [
                    "Acompanhamento",
                    `Enviada: ${draft.sent_at ? "sim" : "não"} · Visualizada: ${draft.first_viewed_at ? "sim" : "não"} · Aprovada: ${draft.approved_at ? "sim" : "não"}`,
                  ],
                ].map(([l, v]) => (
                  <div key={l} className="grid gap-1 py-3.5 text-sm sm:grid-cols-[220px_1fr]">
                    <dt className="text-muted-foreground">{l}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="overflow-hidden rounded-xl border border-border shadow-soft">
              <ProposalDocument proposal={{ ...draft, prices, sections }} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl rounded-xl border border-border bg-card p-8 shadow-soft">
      {children}
    </div>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
