import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calcInvestment } from "./dataponto";
import { pricesOf, type Proposal } from "./proposal";

/** Código da categoria que usa a experiência clássica de relógio de ponto. */
export const PONTO = "ponto";

export type Area = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  sort_order: number;
};

export type Subcategory = {
  id: string;
  area_id: string;
  code: string;
  name: string;
  active: boolean;
  sort_order: number;
};

export type CatalogProduct = {
  id: string;
  code: string;
  name: string;
  kind: string;
  billing: string;
  description: string;
  default_price: number;
  features: string[];
  benefits: string[];
  main_image_url: string | null;
  gallery: string[];
  active: boolean;
  sort_order: number;
  area_id: string | null;
  subcategory_id: string | null;
  highlight: string;
  tech_note: string;
};

/** Item de proposta (cópia histórica do produto no momento da proposta). */
export type ProposalItem = {
  id?: string;
  proposal_id?: string;
  product_id: string | null;
  area_code: string;
  scenario: string;
  name: string;
  billing: string;
  quantity: number;
  unit_price: number;
  sort_order: number;
  description: string;
  features: string[];
  benefits: string[];
  image_url: string | null;
};

export type ProposalSolution = {
  id?: string;
  area_code: string;
  area_id: string | null;
  why_text: string;
  sort_order: number;
};

export type ProposalScenario = {
  id?: string;
  key: string;
  title: string;
  description: string;
  monthly_total: number;
  upfront_total: number;
  recommended: boolean;
  sort_order: number;
};

export type Composition = {
  items: ProposalItem[];
  solutions: ProposalSolution[];
  scenarios: ProposalScenario[];
};

export const EMPTY_COMPOSITION: Composition = { items: [], solutions: [], scenarios: [] };

export const areaCodesOf = (p: Pick<Proposal, "area_codes">): string[] =>
  Array.isArray(p.area_codes) && p.area_codes.length ? p.area_codes : [PONTO];

/** A proposta usa o módulo clássico de controle de ponto? */
export const hasPonto = (p: Pick<Proposal, "area_codes">) => areaCodesOf(p).includes(PONTO);

export function snapshotOf(p: CatalogProduct, areaCode: string, order = 0): ProposalItem {
  return {
    product_id: p.id,
    area_code: areaCode,
    scenario: "essencial",
    name: p.name,
    billing: p.billing,
    quantity: 1,
    unit_price: Number(p.default_price),
    sort_order: order,
    description: p.description ?? "",
    features: Array.isArray(p.features) ? p.features : [],
    benefits: Array.isArray(p.benefits) ? p.benefits : [],
    image_url: p.main_image_url ?? null,
  };
}

export function itemsTotals(items: ProposalItem[]) {
  let monthly = 0;
  let upfront = 0;
  for (const it of items) {
    const sub = Number(it.unit_price) * Number(it.quantity);
    if (it.billing === "monthly") monthly += sub;
    else upfront += sub;
  }
  return { monthly, upfront };
}

/**
 * Investimento total = módulo clássico de ponto (quando selecionado)
 * + subtotal dos itens das demais categorias.
 */
export function totalInvestment(p: Proposal, items: ProposalItem[]) {
  const ponto = hasPonto(p)
    ? calcInvestment({
        modality: p.modality,
        plan: p.system_plan,
        deviceQty: p.device_qty,
        prices: pricesOf(p),
      })
    : { primme: 0, system: 0, monthly: 0, upfront: 0 };
  const extra = itemsTotals(items.filter((i) => i.area_code !== PONTO));
  return {
    ponto,
    extra,
    monthly: ponto.monthly + extra.monthly,
    upfront: ponto.upfront + extra.upfront,
  };
}

export function groupByArea<T extends { area_code: string }>(rows: T[]) {
  const map = new Map<string, T[]>();
  for (const r of rows) {
    const list = map.get(r.area_code) ?? [];
    list.push(r);
    map.set(r.area_code, list);
  }
  return map;
}

const toStrArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x)) : [];

export const normalizeProduct = (row: Record<string, unknown>): CatalogProduct => ({
  id: String(row['id']),
  code: String(row['code'] ?? ""),
  name: String(row['name'] ?? ""),
  kind: String(row['kind'] ?? "equipment"),
  billing: String(row['billing'] ?? "onetime"),
  description: String(row['description'] ?? ""),
  default_price: Number(row['default_price'] ?? 0),
  features: toStrArr(row['features']),
  benefits: toStrArr(row['benefits']),
  main_image_url: (row['main_image_url'] as string | null) ?? null,
  gallery: toStrArr(row['gallery']),
  active: Boolean(row['active']),
  sort_order: Number(row['sort_order'] ?? 0),
  area_id: (row['area_id'] as string | null) ?? null,
  subcategory_id: (row['subcategory_id'] as string | null) ?? null,
  highlight: String(row['highlight'] ?? ""),
  tech_note: String(row['tech_note'] ?? ""),
});

const normalizeItem = (row: Record<string, unknown>): ProposalItem => ({
  id: String(row['id']),
  proposal_id: String(row['proposal_id']),
  product_id: (row['product_id'] as string | null) ?? null,
  area_code: String(row['area_code'] ?? ""),
  scenario: String(row['scenario'] ?? "essencial"),
  name: String(row['name'] ?? ""),
  billing: String(row['billing'] ?? "onetime"),
  quantity: Number(row['quantity'] ?? 1),
  unit_price: Number(row['unit_price'] ?? 0),
  sort_order: Number(row['sort_order'] ?? 0),
  description: String(row['description'] ?? ""),
  features: toStrArr(row['features']),
  benefits: toStrArr(row['benefits']),
  image_url: (row['image_url'] as string | null) ?? null,
});

/** Catálogo: categorias ativas, subcategorias e produtos. */
export function useCatalog(opts?: { activeOnly?: boolean }) {
  const activeOnly = opts?.activeOnly ?? true;
  return useQuery({
    queryKey: ["catalog", activeOnly],
    staleTime: 30_000,
    queryFn: async () => {
      const [areas, subs, products] = await Promise.all([
        supabase.from("solution_areas").select("*").order("sort_order"),
        supabase.from("solution_subcategories").select("*").order("sort_order"),
        supabase.from("products").select("*").order("sort_order"),
      ]);
      if (areas.error) throw areas.error;
      if (subs.error) throw subs.error;
      if (products.error) throw products.error;
      const allAreas = (areas.data ?? []) as unknown as Area[];
      const allProducts = ((products.data ?? []) as Record<string, unknown>[]).map(normalizeProduct);
      return {
        areas: activeOnly ? allAreas.filter((a) => a.active) : allAreas,
        subcategories: (subs.data ?? []) as unknown as Subcategory[],
        products: activeOnly ? allProducts.filter((p) => p.active) : allProducts,
      };
    },
  });
}

/** Composição salva de uma proposta (itens, soluções e cenários). */
export function useComposition(proposalId: string | undefined) {
  return useQuery({
    queryKey: ["proposal-composition", proposalId],
    enabled: !!proposalId,
    queryFn: async (): Promise<Composition> => {
      const [items, solutions, scenarios] = await Promise.all([
        supabase
          .from("proposal_products")
          .select("*")
          .eq("proposal_id", proposalId!)
          .order("sort_order"),
        supabase
          .from("proposal_solutions")
          .select("*")
          .eq("proposal_id", proposalId!)
          .order("sort_order"),
        supabase
          .from("proposal_scenarios")
          .select("*")
          .eq("proposal_id", proposalId!)
          .order("sort_order"),
      ]);
      return {
        items: ((items.data ?? []) as Record<string, unknown>[]).map(normalizeItem),
        solutions: (solutions.data ?? []) as unknown as ProposalSolution[],
        scenarios: (scenarios.data ?? []) as unknown as ProposalScenario[],
      };
    },
  });
}

/** Grava itens e soluções de uma proposta (substitui a composição anterior). */
export async function saveComposition(
  proposalId: string,
  data: {
    areaCodes: string[];
    items: ProposalItem[];
    solutions: { area_code: string; area_id: string | null; why_text: string }[];
    scenarios?: ProposalScenario[];
    totals: { monthly: number; upfront: number };
  },
) {
  const del = await Promise.all([
    supabase.from("proposal_products").delete().eq("proposal_id", proposalId),
    supabase.from("proposal_solutions").delete().eq("proposal_id", proposalId),
    supabase.from("proposal_scenarios").delete().eq("proposal_id", proposalId),
  ]);
  for (const d of del) if (d.error) throw d.error;

  if (data.items.length) {
    const { error } = await supabase.from("proposal_products").insert(
      data.items.map((it, i) => ({
        proposal_id: proposalId,
        product_id: it.product_id,
        area_code: it.area_code,
        scenario: it.scenario,
        name: it.name,
        billing: it.billing,
        quantity: it.quantity,
        unit_price: it.unit_price,
        sort_order: i,
        description: it.description,
        features: it.features,
        benefits: it.benefits,
        image_url: it.image_url,
      })) as never,
    );
    if (error) throw error;
  }
  if (data.solutions.length) {
    const { error } = await supabase.from("proposal_solutions").insert(
      data.solutions.map((s, i) => ({
        proposal_id: proposalId,
        area_id: s.area_id,
        area_code: s.area_code,
        why_text: s.why_text,
        sort_order: i,
      })) as never,
    );
    if (error) throw error;
  }
  if (data.scenarios?.length) {
    const { error } = await supabase.from("proposal_scenarios").insert(
      data.scenarios.map((s, i) => ({
        proposal_id: proposalId,
        key: s.key,
        title: s.title,
        description: s.description,
        monthly_total: s.monthly_total,
        upfront_total: s.upfront_total,
        recommended: s.recommended,
        sort_order: i,
      })) as never,
    );
    if (error) throw error;
  }
  const { error } = await supabase
    .from("proposals")
    .update({
      area_codes: data.areaCodes,
      monthly_total: data.totals.monthly,
      upfront_total: data.totals.upfront,
    } as never)
    .eq("id", proposalId);
  if (error) throw error;
}
