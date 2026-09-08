import { useMemo } from "react";
import { buildSections } from "./sections";
import { Reveal } from "./motion";
import { AreaModule, ScenariosBlock } from "./SolutionModules";
import { sectionsOf, type Proposal } from "@/lib/proposal";
import { PONTO_ONLY_SECTIONS, SECTION_ORDER } from "@/lib/dataponto";
import {
  EMPTY_COMPOSITION,
  PONTO,
  groupByArea,
  hasPonto,
  useCatalog,
  useComposition,
} from "@/lib/solutions";

export type VisibleSection = { key: string; node: React.ReactNode };

/**
 * Lista de seções visíveis da proposta.
 * - Seções clássicas de Controle de Ponto só aparecem quando a categoria "ponto" está na proposta.
 * - Cada outra categoria (acesso, veicular, monitoramento…) vira um módulo próprio,
 *   inserido antes do Investimento.
 */
export function useVisibleSections(proposal: Proposal, publicView = false): VisibleSection[] {
  const { data: comp } = useComposition(proposal.id);
  const { data: catalog } = useCatalog({ activeOnly: false });

  return useMemo(() => {
    const c = comp ?? EMPTY_COMPOSITION;
    const areaNames = Object.fromEntries((catalog?.areas ?? []).map((a) => [a.code, a.name]));
    const areaOrder = Object.fromEntries((catalog?.areas ?? []).map((a) => [a.code, a.sort_order]));
    const enabled = sectionsOf(proposal);
    const ponto = hasPonto(proposal);
    const all = buildSections(proposal, { publicView, items: c.items, areaNames });

    const extraItems = c.items.filter((i) => i.area_code !== PONTO);
    const groups = [...groupByArea(extraItems).entries()].sort(
      ([a], [b]) => (areaOrder[a] ?? 99) - (areaOrder[b] ?? 99),
    );
    const modules: VisibleSection[] = groups.map(([code, rows]) => ({
      key: `modulo:${code}`,
      node: (
        <AreaModule
          code={code}
          name={areaNames[code] ?? code}
          items={rows}
          why={c.solutions.find((s) => s.area_code === code)?.why_text ?? ""}
        />
      ),
    }));
    if (c.scenarios.length > 1) {
      modules.push({ key: "cenarios", node: <ScenariosBlock scenarios={c.scenarios} /> });
    }

    const out: VisibleSection[] = [];
    let inserted = false;
    for (const k of SECTION_ORDER) {
      if (!enabled[k]) continue;
      if (!ponto && PONTO_ONLY_SECTIONS.includes(k)) continue;
      if ((k === "investimento" || k === "cta") && !inserted) {
        out.push(...modules);
        inserted = true;
      }
      out.push({ key: k, node: all.find((s) => s.key === k)?.node ?? null });
    }
    if (!inserted) out.push(...modules);
    return out;
  }, [proposal, publicView, comp, catalog]);
}

export function ProposalDocument({
  proposal,
  publicView = false,
}: {
  proposal: Proposal;
  publicView?: boolean;
}) {
  const sections = useVisibleSections(proposal, publicView);
  return (
    <div className="w-full">
      {sections.map((s, i) => (
        <Reveal key={s.key} delay={i === 0 ? 0 : 0.05} y={i === 0 ? 0 : 28}>
          {s.node}
        </Reveal>
      ))}
    </div>
  );
}
