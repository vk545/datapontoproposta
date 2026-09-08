import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_PRICES,
  NEEDS,
  NEED_OPTIONS,
  PONTO_ONLY_SECTIONS,
  SECTION_LABELS,
  SECTION_ORDER,
  TEMPLATE_CONSULTIVA,
  TEMPLATE_ESSENCIAL,
  currency,
  type NeedKey,
  type SectionKey,
} from "@/lib/dataponto";
import { AreaCards, ProductPicker } from "@/components/proposal/SolutionPicker";
import {
  PONTO,
  itemsTotals,
  saveComposition,
  totalInvestment,
  useCatalog,
  type ProposalItem,
} from "@/lib/solutions";
import type { Proposal } from "@/lib/proposal";

export const Route = createFileRoute("/propostas/nova")({
  head: () => ({
    meta: [
      { title: "Nova proposta — Dataponto Propostas" },
      {
        name: "description",
        content:
          "Fluxo consultivo para criar uma proposta Dataponto: cliente, necessidade, solução e investimento.",
      },
      { property: "og:title", content: "Nova proposta — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Fluxo consultivo para criar uma proposta Dataponto.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <NewProposal />
    </AppShell>
  ),
});

const STEPS = ["Cliente", "Soluções", "Necessidade", "Produtos", "Personalização", "Raio-X"];

function NewProposal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [seller, setSeller] = useState({ name: "", email: "", phone: "" });

  const [form, setForm] = useState({
    company_name: "",
    cnpj: "",
    contact_name: "",
    contact_role: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    employees: 0,
    need_key: "" as NeedKey | "",
    problem_text: "",
    template: "consultiva",
    modality: "primme" as "primme" | "compra",
    system_plan: "pro" as "pro" | "ultimate" | "nenhum",
    licenses: 10,
    device_qty: 1,
    valid_until: "",
    notes: "",
  });
  const [prices, setPrices] = useState(DEFAULT_PRICES);
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({ ...TEMPLATE_CONSULTIVA });
  const [areaCodes, setAreaCodes] = useState<string[]>([PONTO]);
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [why, setWhy] = useState<Record<string, string>>({});
  const { data: catalog } = useCatalog();
  const areas = catalog?.areas ?? [];
  const products = catalog?.products ?? [];
  const ponto = areaCodes.includes(PONTO);
  const visibleItems = items.filter((i) => areaCodes.includes(i.area_code));
  const areaName = (code: string) => areas.find((a) => a.code === code)?.name ?? code;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("name,email,phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as { name?: string; email?: string; phone?: string } | null;
        setSeller({
          name: p?.name || user.email?.split("@")[0] || "",
          email: p?.email || user.email || "",
          phone: p?.phone || "",
        });
      });
  }, [user]);

  const set = (k: keyof typeof form, v: string | number) => setForm({ ...form, [k]: v });
  const narrative = form.need_key ? NEEDS[form.need_key] : null;
  const inv = totalInvestment(
    {
      modality: form.modality,
      system_plan: form.system_plan,
      device_qty: form.device_qty,
      prices,
      area_codes: areaCodes,
    } as unknown as Proposal,
    visibleItems,
  );

  /** Seções só de Controle de Ponto ficam desligadas quando a categoria não está na proposta. */
  const sectionsFor = (base: Record<SectionKey, boolean>, withPonto: boolean) =>
    withPonto
      ? { ...base }
      : (Object.fromEntries(
          SECTION_ORDER.map((k) => [k, PONTO_ONLY_SECTIONS.includes(k) ? false : base[k]]),
        ) as Record<SectionKey, boolean>);

  function applyTemplate(t: "consultiva" | "essencial") {
    setForm({ ...form, template: t });
    setSections(sectionsFor(t === "consultiva" ? TEMPLATE_CONSULTIVA : TEMPLATE_ESSENCIAL, ponto));
  }

  function changeAreas(next: string[]) {
    setAreaCodes(next);
    const base = form.template === "consultiva" ? TEMPLATE_CONSULTIVA : TEMPLATE_ESSENCIAL;
    setSections(sectionsFor(base, next.includes(PONTO)));
  }

  function applyRecommendation() {
    if (!narrative) return;
    setForm({
      ...form,
      modality: narrative.recommend.modality,
      system_plan: narrative.recommend.plan,
    });
    toast.success("Recomendação aplicada.");
  }

  async function create() {
    if (!form.company_name.trim()) {
      toast.error("Informe o nome da empresa.");
      setStep(0);
      return;
    }
    if (!areaCodes.length) {
      toast.error("Escolha ao menos uma solução.");
      setStep(1);
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("proposals")
      .insert({
        ...form,
        need_key: form.need_key || "outro",
        valid_until: form.valid_until || null,
        prices,
        sections,
        texts: {},
        calculator: {},
        monthly_total: inv.monthly,
        upfront_total: inv.upfront,
        seller_name: seller.name,
        seller_email: seller.email,
        seller_phone: seller.phone,
        area_codes: areaCodes,
      } as never)
      .select("id")
      .single();
    if (error) {
      setSaving(false);
      toast.error("Não foi possível criar a proposta.");
      return;
    }
    const newId = (data as { id: string }).id;
    try {
      const codes = [
        ...new Set([...(ponto ? [PONTO] : []), ...visibleItems.map((i) => i.area_code)]),
      ];
      await saveComposition(newId, {
        areaCodes,
        items: visibleItems,
        solutions: codes.map((code) => ({
          area_code: code,
          area_id: areas.find((a) => a.code === code)?.id ?? null,
          why_text: why[code] ?? "",
        })),
        totals: { monthly: inv.monthly, upfront: inv.upfront },
      });
    } catch {
      toast.error("Proposta criada, mas os produtos não foram salvos. Revise na aba Soluções.");
    }
    setSaving(false);
    toast.success("Proposta criada.");
    navigate({ to: "/propostas/$id/editar", params: { id: newId } });
  }

  return (
    <>
      <PageHeader title="Nova proposta" description="Cliente, solução, produtos e investimento." />
      <div className="p-8">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                i === step
                  ? "border-institutional bg-institutional text-institutional-foreground"
                  : i < step
                    ? "border-brand/40 bg-brand-soft text-institutional"
                    : "border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span>{i + 1}</span>}
              {s}
            </button>
          ))}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="mt-8 max-w-3xl rounded-xl border border-border bg-card p-8 shadow-soft">
          {step === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Empresa" full>
                <Input
                  value={form.company_name}
                  onChange={(e) => set("company_name", e.target.value)}
                />
              </Field>
              <Field label="CNPJ">
                <Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} />
              </Field>
              <Field label="Responsável">
                <Input
                  value={form.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                />
              </Field>
              <Field label="Cargo">
                <Input
                  value={form.contact_role}
                  onChange={(e) => set("contact_role", e.target.value)}
                />
              </Field>
              <Field label="Telefone">
                <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="E-mail">
                <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Cidade">
                <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
              <Field label="Estado">
                <Input value={form.state} onChange={(e) => set("state", e.target.value)} />
              </Field>
              <Field label="Colaboradores">
                <Input
                  type="number"
                  value={String(form.employees)}
                  onChange={(e) => set("employees", Number(e.target.value))}
                />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <p className="text-sm font-semibold">Qual solução está sendo apresentada?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Selecione uma ou várias. A proposta mostrará somente os produtos e seções dessas
                soluções.
              </p>
              <div className="mt-5">
                <AreaCards areas={areas} value={areaCodes} onChange={changeAreas} />
              </div>
              {!areaCodes.length ? (
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} />
                  Escolha ao menos uma solução para continuar.
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <p className="text-sm font-semibold">Principal necessidade do cliente</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {NEED_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => set("need_key", o.value)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      form.need_key === o.value
                        ? "border-brand bg-brand-soft"
                        : "border-border hover:bg-surface"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <Label>Descreva o principal problema do cliente</Label>
                <Textarea
                  className="mt-1.5"
                  rows={4}
                  value={form.problem_text}
                  onChange={(e) => set("problem_text", e.target.value)}
                  placeholder="O que o cliente relatou sobre a operação atual?"
                />
              </div>
              {!form.need_key && !form.problem_text ? (
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} />
                  Antes de finalizar, identifique o principal problema que esta solução resolve.
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <ProductPicker
              areas={areas}
              products={products}
              areaCodes={areaCodes}
              items={visibleItems}
              onItems={setItems}
              why={why}
              onWhy={setWhy}
              pontoSlot={
            <div className="space-y-8">
              {narrative ? (
                <div className="rounded-lg border border-brand/30 bg-brand-soft p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-institutional">
                    Solução recomendada
                  </p>
                  <p className="mt-2 text-sm">
                    Relógio facial · {narrative.recommend.modality === "primme" ? "Comodato" : "Compra"}{" "}
                    · Secullum RH {narrative.recommend.plan === "pro" ? "Pro" : "Ultimate"}
                  </p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={applyRecommendation}>
                    Aplicar recomendação
                  </Button>
                </div>
              ) : null}
              <Choice
                label="Modalidade do equipamento"
                value={form.modality}
                onChange={(v) => set("modality", v)}
                options={[
                  { value: "primme", label: "Comodato", hint: `${currency(prices.primme)}/mês` },
                  { value: "compra", label: "Compra", hint: `${currency(prices.equipment)} à vista` },
                ]}
              />
              <Choice
                label="Sistema de gestão"
                value={form.system_plan}
                onChange={(v) => set("system_plan", v)}
                options={[
                  { value: "pro", label: "Secullum RH Pro", hint: `${currency(prices.pro)}/mês` },
                  {
                    value: "ultimate",
                    label: "Secullum RH Ultimate",
                    hint: `${currency(prices.ultimate)}/mês`,
                  },
                  { value: "nenhum", label: "Sem sistema", hint: "somente equipamento" },
                ]}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Equipamentos">
                  <Input
                    type="number"
                    min={1}
                    value={String(form.device_qty)}
                    onChange={(e) => set("device_qty", Number(e.target.value))}
                  />
                </Field>
                <Field label="Licenças (colaboradores)">
                  <Input
                    type="number"
                    min={10}
                    value={String(form.licenses)}
                    onChange={(e) => set("licenses", Number(e.target.value))}
                  />
                </Field>
              </div>
              <div>
                <p className="text-sm font-semibold">Preços aplicados nesta proposta</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-4">
                  {(
                    [
                      ["equipment", "Equipamento"],
                      ["primme", "Comodato/mês"],
                      ["pro", "Pro/mês"],
                      ["ultimate", "Ultimate/mês"],
                    ] as const
                  ).map(([k, l]) => (
                    <Field key={k} label={l}>
                      <Input
                        type="number"
                        value={String(prices[k])}
                        onChange={(e) => setPrices({ ...prices, [k]: Number(e.target.value) })}
                      />
                    </Field>
                  ))}
                </div>
              </div>
            </div>
              }
            />
          ) : null}

          {step === 4 ? (
            <div className="space-y-8">
              <Choice
                label="Formato da proposta"
                value={form.template}
                onChange={(v) => applyTemplate(v as "consultiva" | "essencial")}
                options={[
                  {
                    value: "consultiva",
                    label: "Proposta Consultiva",
                    hint: "recomendada para novos clientes",
                  },
                  {
                    value: "essencial",
                    label: "Proposta Essencial",
                    hint: "para quem já sabe o que quer",
                  },
                ]}
              />
              <div>
                <p className="text-sm font-semibold">Seções ativas</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {SECTION_ORDER.filter((k) => ponto || !PONTO_ONLY_SECTIONS.includes(k)).map((k) => (
                    <label
                      key={k}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--brand)]"
                        checked={sections[k]}
                        onChange={(e) => setSections({ ...sections, [k]: e.target.checked })}
                      />
                      {SECTION_LABELS[k]}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Validade">
                  <Input
                    type="date"
                    value={form.valid_until}
                    onChange={(e) => set("valid_until", e.target.value)}
                  />
                </Field>
                <Field label="Observações internas">
                  <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                </Field>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Raio-X da proposta
              </p>
              <dl className="mt-5 divide-y divide-border">
                {[
                  ["Cliente", form.company_name || "—"],
                  ["Soluções", areaCodes.map(areaName).join(" · ") || "—"],
                  ["Problema identificado", narrative?.label ?? "—"],
                  ["Cenário relatado", form.problem_text || "—"],
                  ...(ponto
                    ? ([
                        ["Controle de Ponto", `Relógio de ponto facial · ${form.device_qty} equipamento(s)`],
                        ["Proteção", form.modality === "primme" ? "Comodato" : "Compra do equipamento"],
                        [
                          "Gestão",
                          form.system_plan === "nenhum"
                            ? "Sem sistema"
                            : `Secullum RH ${form.system_plan === "pro" ? "Pro" : "Ultimate"}`,
                        ],
                      ] as [string, string][])
                    : []),
                  ...visibleItems.map(
                    (i) =>
                      [
                        areaName(i.area_code),
                        `${i.quantity}× ${i.name} · ${currency(itemsTotals([i]).monthly + itemsTotals([i]).upfront)}`,
                      ] as [string, string],
                  ),
                  [
                    "Investimento",
                    `${currency(inv.monthly)}/mês${inv.upfront ? ` + ${currency(inv.upfront)} inicial` : ""}`,
                  ],
                ].map(([l, v]) => (
                  <div key={`${l}${v}`} className="grid grid-cols-[200px_1fr] gap-4 py-3.5 text-sm">
                    <dt className="text-muted-foreground">{l}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
              Voltar
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>
                Continuar
                <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} />
              </Button>
            ) : (
              <Button onClick={create} disabled={saving}>
                Criar proposta
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg border px-4 py-3 text-left transition-colors ${
              value === o.value ? "border-brand bg-brand-soft" : "border-border hover:bg-surface"
            }`}
          >
            <span className="block text-sm font-medium">{o.label}</span>
            {o.hint ? <span className="text-xs text-muted-foreground">{o.hint}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
