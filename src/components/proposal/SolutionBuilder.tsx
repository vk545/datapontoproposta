import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Layers, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/dataponto";
import type { Proposal } from "@/lib/proposal";
import {
  PONTO,
  areaCodesOf,
  saveComposition,
  totalInvestment,
  useCatalog,
  useComposition,
  type ProposalItem,
} from "@/lib/solutions";
import { AreaCards, ProductPicker } from "./SolutionPicker";

/**
 * Configurador de soluções dentro do editor: categorias, produtos por categoria,
 * quantidades, preços aplicados e o texto "Por que esta solução?".
 * O módulo de Controle de Ponto continua sendo configurado na aba "Solução".
 */
export function SolutionBuilder({
  proposal,
  onSaved,
}: {
  proposal: Proposal;
  onSaved?: (patch: Partial<Proposal>) => void;
}) {
  const qc = useQueryClient();
  const { data: catalog } = useCatalog();
  const { data: comp } = useComposition(proposal.id);

  const [areaCodes, setAreaCodes] = useState<string[]>(areaCodesOf(proposal));
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [why, setWhy] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!comp || loaded) return;
    setItems(comp.items.filter((i) => i.area_code !== PONTO));
    setWhy(Object.fromEntries(comp.solutions.map((s) => [s.area_code, s.why_text ?? ""])));
    setLoaded(true);
  }, [comp, loaded]);

  const areas = catalog?.areas ?? [];
  const products = catalog?.products ?? [];
  const areaById = useMemo(() => Object.fromEntries(areas.map((a) => [a.id, a])), [areas]);

  // Itens de categorias que foram desmarcadas saem da proposta.
  const visibleItems = items.filter((i) => areaCodes.includes(i.area_code));
  const totals = totalInvestment({ ...proposal, area_codes: areaCodes }, visibleItems);

  async function save() {
    if (!areaCodes.length) {
      toast.error("Escolha ao menos uma solução.");
      return;
    }
    setSaving(true);
    try {
      const codesWithItems = [
        ...new Set([
          ...areaCodes.filter((c) => c === PONTO),
          ...visibleItems.map((i) => i.area_code),
        ]),
      ];
      await saveComposition(proposal.id, {
        areaCodes,
        items: visibleItems,
        solutions: codesWithItems.map((code) => ({
          area_code: code,
          area_id: areas.find((a) => a.code === code)?.id ?? null,
          why_text: why[code] ?? "",
        })),
        totals: { monthly: totals.monthly, upfront: totals.upfront },
      });
      qc.invalidateQueries({ queryKey: ["proposal-composition", proposal.id] });
      qc.invalidateQueries({ queryKey: ["proposal", proposal.id] });
      onSaved?.({
        area_codes: areaCodes,
        monthly_total: totals.monthly,
        upfront_total: totals.upfront,
      });
      toast.success("Solução da proposta salva.");
    } catch {
      toast.error("Não foi possível salvar a solução.");
    } finally {
      setSaving(false);
    }
  }

  if (!catalog || !comp) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando catálogo…
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold">Qual solução está sendo apresentada?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Selecione uma ou várias. Somente os produtos das categorias escolhidas aparecem abaixo.
          </p>
          <div className="mt-4">
            <AreaCards areas={areas} value={areaCodes} onChange={setAreaCodes} />
          </div>
        </div>

        <ProductPicker
          areas={areas}
          products={products}
          areaCodes={areaCodes}
          items={visibleItems}
          onItems={setItems}
          why={why}
          onWhy={setWhy}
          pontoSlot={
            <p className="rounded-lg border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
              Relógio, sistema de gestão, modalidade e quantidades do Controle de Ponto são
              configurados na aba <strong>Solução</strong>. As seções clássicas continuam iguais.
            </p>
          }
        />
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> Resumo da solução
          </p>

          <ul className="mt-4 space-y-3">
            {areaCodes.includes(PONTO) ? (
              <li>
                <p className="text-xs font-semibold text-institutional">Controle de Ponto</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {proposal.device_qty}× relógio ·{" "}
                  {proposal.modality === "primme" ? "Comodato" : "Compra"} ·{" "}
                  {proposal.system_plan === "nenhum"
                    ? "sem sistema"
                    : `Secullum RH ${proposal.system_plan === "pro" ? "Pro" : "Ultimate"}`}
                </p>
              </li>
            ) : null}
            {areaCodes
              .filter((c) => c !== PONTO)
              .map((code) => {
                const rows = visibleItems.filter((i) => i.area_code === code);
                const area = areas.find((a) => a.code === code);
                return (
                  <li key={code}>
                    <p className="text-xs font-semibold text-institutional">
                      {area?.name ?? code}
                    </p>
                    {rows.length === 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">Nenhum item selecionado.</p>
                    ) : (
                      <ul className="mt-1 space-y-0.5">
                        {rows.map((s) => (
                          <li
                            key={s.product_id ?? s.name}
                            className="flex justify-between gap-3 text-xs text-muted-foreground"
                          >
                            <span>
                              {s.quantity}× {s.name}
                            </span>
                            <span>{currency(s.unit_price * s.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Total mensal</p>
            <p className="text-xl font-semibold text-institutional">{currency(totals.monthly)}</p>
            <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
              Investimento inicial
            </p>
            <p className="text-lg font-semibold">{currency(totals.upfront)}</p>
            {void areaById}
          </div>

          <Button className="mt-5 w-full" onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
            {saving ? "Salvando…" : "Salvar solução"}
          </Button>
        </div>
      </aside>
    </div>
  );
}
