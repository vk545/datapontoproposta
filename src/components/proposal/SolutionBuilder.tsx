import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Layers, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/dataponto";

type Area = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
};

type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  billing: string;
  default_price: number;
  area_id: string | null;
  highlight: string;
};

type ScenarioKey = "essencial" | "recomendada" | "completa";

const SCENARIOS: { key: ScenarioKey; title: string; description: string }[] = [
  {
    key: "essencial",
    title: "Essencial",
    description: "O mínimo necessário para resolver o problema principal com segurança.",
  },
  {
    key: "recomendada",
    title: "Recomendada",
    description: "O equilíbrio entre operação, gestão e continuidade do serviço.",
  },
  {
    key: "completa",
    title: "Completa",
    description: "A operação inteira conectada, com o máximo de automação e proteção.",
  },
];

const RANK: Record<ScenarioKey, number> = { essencial: 0, recomendada: 1, completa: 2 };

type Selected = {
  product_id: string;
  area_code: string;
  name: string;
  billing: string;
  quantity: number;
  unit_price: number;
  scenario: ScenarioKey;
};

export function SolutionBuilder({ proposalId }: { proposalId: string }) {
  const [selected, setSelected] = useState<Record<string, Selected>>({});
  const [why, setWhy] = useState<Record<string, string>>({});
  const [recommended, setRecommended] = useState<ScenarioKey>("recomendada");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { data } = useQuery({
    queryKey: ["solution-builder", proposalId],
    queryFn: async () => {
      const [areas, products, solutions, chosen, scenarios] = await Promise.all([
        supabase.from("solution_areas").select("*").eq("active", true).order("sort_order"),
        supabase.from("products").select("*").eq("active", true).order("sort_order"),
        supabase.from("proposal_solutions").select("*").eq("proposal_id", proposalId),
        supabase.from("proposal_products").select("*").eq("proposal_id", proposalId),
        supabase.from("proposal_scenarios").select("*").eq("proposal_id", proposalId),
      ]);
      return {
        areas: (areas.data ?? []) as unknown as Area[],
        products: (products.data ?? []) as unknown as Product[],
        solutions: solutions.data ?? [],
        chosen: chosen.data ?? [],
        scenarios: scenarios.data ?? [],
      };
    },
  });

  useEffect(() => {
    if (!data || loaded) return;
    const sel: Record<string, Selected> = {};
    for (const row of data.chosen as Array<Record<string, unknown>>) {
      const pid = row['product_id'] as string | null;
      if (!pid) continue;
      sel[pid] = {
        product_id: pid,
        area_code: String(row['area_code'] ?? ""),
        name: String(row['name'] ?? ""),
        billing: String(row['billing'] ?? "monthly"),
        quantity: Number(row['quantity'] ?? 1),
        unit_price: Number(row['unit_price'] ?? 0),
        scenario: (row['scenario'] as ScenarioKey) ?? "essencial",
      };
    }
    const w: Record<string, string> = {};
    for (const row of data.solutions as Array<Record<string, unknown>>) {
      w[String(row['area_code'])] = String(row['why_text'] ?? "");
    }
    const rec = (data.scenarios as Array<Record<string, unknown>>).find((s) => s['recommended']);
    if (rec) setRecommended(String(rec['key']) as ScenarioKey);
    setSelected(sel);
    setWhy(w);
    setLoaded(true);
  }, [data, loaded]);

  const areas = data?.areas ?? [];
  const products = data?.products ?? [];
  const areaByCode = useMemo(
    () => Object.fromEntries(areas.map((a) => [a.code, a])),
    [areas],
  );

  const list = Object.values(selected);
  const activeAreaCodes = [...new Set(list.map((s) => s.area_code))];

  const totalsFor = (key: ScenarioKey) => {
    const items = list.filter((s) => RANK[s.scenario] <= RANK[key]);
    return {
      monthly: items
        .filter((s) => s.billing === "monthly")
        .reduce((t, s) => t + s.unit_price * s.quantity, 0),
      upfront: items
        .filter((s) => s.billing !== "monthly")
        .reduce((t, s) => t + s.unit_price * s.quantity, 0),
      count: items.length,
    };
  };

  function toggle(p: Product) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[p.id]) delete next[p.id];
      else
        next[p.id] = {
          product_id: p.id,
          area_code: areas.find((a) => a.id === p.area_id)?.code ?? "outros",
          name: p.name,
          billing: p.billing,
          quantity: 1,
          unit_price: Number(p.default_price),
          scenario: "essencial",
        };
      return next;
    });
  }

  const patch = (id: string, p: Partial<Selected>) =>
    setSelected((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], ...p } } : prev));

  async function save() {
    setSaving(true);
    try {
      await Promise.all([
        supabase.from("proposal_products").delete().eq("proposal_id", proposalId),
        supabase.from("proposal_solutions").delete().eq("proposal_id", proposalId),
        supabase.from("proposal_scenarios").delete().eq("proposal_id", proposalId),
      ]);

      if (list.length) {
        const { error } = await supabase.from("proposal_products").insert(
          list.map((s, i) => ({
            proposal_id: proposalId,
            product_id: s.product_id,
            area_code: s.area_code,
            scenario: s.scenario,
            name: s.name,
            billing: s.billing,
            quantity: s.quantity,
            unit_price: s.unit_price,
            sort_order: i,
          })) as never,
        );
        if (error) throw error;
      }

      if (activeAreaCodes.length) {
        const { error } = await supabase.from("proposal_solutions").insert(
          activeAreaCodes.map((code, i) => ({
            proposal_id: proposalId,
            area_id: areaByCode[code]?.id ?? null,
            area_code: code,
            why_text: why[code] ?? "",
            sort_order: i,
          })) as never,
        );
        if (error) throw error;
      }

      const usedScenarios = SCENARIOS.filter((s) =>
        list.some((item) => RANK[item.scenario] <= RANK[s.key]),
      );
      if (usedScenarios.length) {
        const { error } = await supabase.from("proposal_scenarios").insert(
          usedScenarios.map((s, i) => {
            const t = totalsFor(s.key);
            return {
              proposal_id: proposalId,
              key: s.key,
              title: s.title,
              description: s.description,
              monthly_total: t.monthly,
              upfront_total: t.upfront,
              recommended: s.key === recommended,
              sort_order: i,
            };
          }) as never,
        );
        if (error) throw error;
      }
      toast.success("Configuração da solução salva.");
    } catch {
      toast.error("Não foi possível salvar a configuração.");
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando catálogo…
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        {areas.map((area) => {
          const items = products.filter((p) => p.area_id === area.id);
          if (!items.length) return null;
          const anySelected = items.some((p) => selected[p.id]);
          return (
            <div
              key={area.id}
              className={`rounded-xl border p-6 transition-colors ${
                anySelected ? "border-brand/50 bg-brand-soft/40" : "border-border bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-institutional">{area.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{area.description}</p>
                </div>
                {anySelected && <Check className="h-4 w-4 shrink-0 text-brand" />}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {items.map((p) => {
                  const sel = selected[p.id];
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg border p-4 text-sm transition-colors ${
                        sel ? "border-brand bg-card" : "border-border bg-background"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
                          checked={!!sel}
                          onChange={() => toggle(p)}
                        />
                        <span>
                          <span className="font-medium">{p.name}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {p.billing === "monthly" ? "Mensal" : "Investimento único"} ·{" "}
                            {currency(Number(p.default_price))}
                          </span>
                        </span>
                      </label>

                      {sel && (
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Qtd.
                            </span>
                            <Input
                              type="number"
                              min={1}
                              className="mt-1 h-8"
                              value={String(sel.quantity)}
                              onChange={(e) =>
                                patch(p.id, { quantity: Math.max(1, Number(e.target.value)) })
                              }
                            />
                          </div>
                          <div>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Valor
                            </span>
                            <Input
                              type="number"
                              className="mt-1 h-8"
                              value={String(sel.unit_price)}
                              onChange={(e) => patch(p.id, { unit_price: Number(e.target.value) })}
                            />
                          </div>
                          <div>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Cenário
                            </span>
                            <select
                              className="mt-1 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                              value={sel.scenario}
                              onChange={(e) =>
                                patch(p.id, { scenario: e.target.value as ScenarioKey })
                              }
                            >
                              {SCENARIOS.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {anySelected && (
                <div className="mt-5">
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Por que esta solução?
                  </span>
                  <Textarea
                    rows={2}
                    className="mt-1.5"
                    placeholder={`Explique ao cliente por que ${area.name.toLowerCase()} faz sentido para a operação dele.`}
                    value={why[area.code] ?? ""}
                    onChange={(e) => setWhy({ ...why, [area.code]: e.target.value })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> Resumo da solução
          </p>

          {list.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Selecione os itens ao lado para montar a solução do cliente.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activeAreaCodes.map((code) => (
                <li key={code}>
                  <p className="text-xs font-semibold text-institutional">
                    {areaByCode[code]?.name ?? code}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {list
                      .filter((s) => s.area_code === code)
                      .map((s) => (
                        <li
                          key={s.product_id}
                          className="flex justify-between gap-3 text-xs text-muted-foreground"
                        >
                          <span>
                            {s.quantity}× {s.name}
                          </span>
                          <span>{currency(s.unit_price * s.quantity)}</span>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 space-y-2 border-t border-border pt-4">
            {SCENARIOS.map((s) => {
              const t = totalsFor(s.key);
              const isRec = recommended === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setRecommended(s.key)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                    isRec ? "border-brand bg-brand-soft" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      {isRec && <Sparkles className="h-3 w-3 text-brand" />}
                      {s.title}
                    </span>
                    <span className="text-muted-foreground">{t.count} itens</span>
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-institutional">
                    {currency(t.monthly)}/mês
                  </span>
                  {t.upfront > 0 && (
                    <span className="block text-xs text-muted-foreground">
                      + {currency(t.upfront)} inicial
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Button className="mt-5 w-full" onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
            {saving ? "Salvando…" : "Salvar configuração"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
