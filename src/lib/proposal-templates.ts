import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Prices, SectionKey } from "./dataponto";
import type { Proposal } from "./proposal";
import type { Composition, ProposalItem, ProposalScenario, ProposalSolution } from "./solutions";

export type ProposalTemplate = {
  id: string;
  name: string;
  template: string;
  area_codes: string[];
  sections: Record<SectionKey, boolean>;
  texts: Record<string, string>;
  prices: Prices;
  solution_settings: {
    modality: Proposal["modality"];
    system_plan: Proposal["system_plan"];
    licenses: number;
    device_qty: number;
  };
  products: ProposalItem[];
  solutions: ProposalSolution[];
  scenarios: ProposalScenario[];
};

const objectOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const arrayOf = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

function normalizeTemplate(row: Record<string, unknown>): ProposalTemplate {
  const settings = objectOf(row["solution_settings"]);
  return {
    id: String(row["id"]),
    name: String(row["name"] ?? ""),
    template: String(row["template"] ?? "consultiva"),
    area_codes: arrayOf<string>(row["area_codes"]).map(String),
    sections: objectOf(row["sections"]) as Record<SectionKey, boolean>,
    texts: objectOf(row["texts"]) as Record<string, string>,
    prices: objectOf(row["prices"]) as unknown as Prices,
    solution_settings: {
      modality: settings["modality"] === "compra" ? "compra" : "primme",
      system_plan:
        settings["system_plan"] === "ultimate" || settings["system_plan"] === "nenhum"
          ? settings["system_plan"]
          : "pro",
      licenses: Number(settings["licenses"] ?? 10),
      device_qty: Number(settings["device_qty"] ?? 1),
    },
    products: arrayOf<ProposalItem>(row["products"]),
    solutions: arrayOf<ProposalSolution>(row["solutions"]),
    scenarios: arrayOf<ProposalScenario>(row["scenarios"]),
  };
}

export function useProposalTemplates() {
  return useQuery({
    queryKey: ["proposal-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposal_templates")
        .select("*")
        .order("name");
      if (error) throw error;
      return ((data ?? []) as Record<string, unknown>[]).map(normalizeTemplate);
    },
  });
}

export async function saveProposalTemplate(
  name: string,
  proposal: Proposal,
  composition: Composition,
) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Informe um nome para o modelo.");

  const products = composition.items.map(({ id: _id, proposal_id: _proposalId, ...item }) => item);
  const solutions = composition.solutions.map(({ id: _id, ...solution }) => solution);
  const scenarios = composition.scenarios.map(({ id: _id, ...scenario }) => scenario);
  const { error } = await supabase.from("proposal_templates").upsert(
    {
      name: cleanName,
      template: proposal.template,
      area_codes: proposal.area_codes ?? [],
      sections: proposal.sections ?? {},
      texts: proposal.texts ?? {},
      prices: proposal.prices ?? {},
      solution_settings: {
        modality: proposal.modality,
        system_plan: proposal.system_plan,
        licenses: proposal.licenses,
        device_qty: proposal.device_qty,
      },
      products,
      solutions,
      scenarios,
    } as never,
    { onConflict: "owner_id,name" },
  );
  if (error) throw error;
}