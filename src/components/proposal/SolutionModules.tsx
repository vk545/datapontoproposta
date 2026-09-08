import { useQuery } from "@tanstack/react-query";
import { Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal, Stagger, StaggerItem } from "@/components/proposal/motion";
import { currency } from "@/lib/dataponto";

type Row = Record<string, unknown>;

export function SolutionModules({ proposalId }: { proposalId: string }) {
  const { data } = useQuery({
    queryKey: ["proposal-modules", proposalId],
    queryFn: async () => {
      const [solutions, products, scenarios, areas] = await Promise.all([
        supabase
          .from("proposal_solutions")
          .select("*")
          .eq("proposal_id", proposalId)
          .order("sort_order"),
        supabase
          .from("proposal_products")
          .select("*")
          .eq("proposal_id", proposalId)
          .order("sort_order"),
        supabase
          .from("proposal_scenarios")
          .select("*")
          .eq("proposal_id", proposalId)
          .order("sort_order"),
        supabase.from("solution_areas").select("*"),
      ]);
      return {
        solutions: (solutions.data ?? []) as Row[],
        products: (products.data ?? []) as Row[],
        scenarios: (scenarios.data ?? []) as Row[],
        areas: (areas.data ?? []) as Row[],
      };
    },
  });

  if (!data || (!data.solutions.length && !data.products.length)) return null;

  const areaName = (code: string) =>
    String(data.areas.find((a) => a['code'] === code)?.['name'] ?? code);

  return (
    <section className="dp-grid-bg relative overflow-hidden border-t border-border/60 px-6 py-20 sm:px-10">
      <div className="dp-aurora pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-5xl">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
            Solução configurada
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
            Os módulos escolhidos para a sua operação.
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
          {data.solutions.map((s) => {
            const code = String(s['area_code']);
            const items = data.products.filter((p) => p['area_code'] === code);
            return (
              <StaggerItem key={String(s['id'])}>
                <div className="dp-glass h-full rounded-2xl border border-border/60 p-6">
                  <p className="text-sm font-semibold text-institutional">{areaName(code)}</p>
                  {String(s['why_text'] ?? "") && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {String(s['why_text'])}
                    </p>
                  )}
                  <ul className="mt-4 space-y-2">
                    {items.map((p) => (
                      <li key={String(p['id'])} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                        <span>
                          {Number(p['quantity'])}× {String(p['name'])}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {data.scenarios.length > 0 && (
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {data.scenarios.map((sc) => {
              const rec = Boolean(sc['recommended']);
              return (
                <StaggerItem key={String(sc['id'])}>
                  <div
                    className={`h-full rounded-2xl border p-6 ${
                      rec ? "border-brand dp-glow-green bg-brand-soft/40" : "border-border/60 dp-glass"
                    }`}
                  >
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-institutional">
                      {rec && <Sparkles className="h-3.5 w-3.5 text-brand" />}
                      {String(sc['title'])}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {String(sc['description'] ?? "")}
                    </p>
                    <p className="mt-4 text-2xl font-semibold">
                      {currency(Number(sc['monthly_total'] ?? 0))}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    {Number(sc['upfront_total'] ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        + {currency(Number(sc['upfront_total']))} inicial
                      </p>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </section>
  );
}
