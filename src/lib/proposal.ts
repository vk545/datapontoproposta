import {
  DEFAULT_CALCULATOR,
  DEFAULT_PRICES,
  NEEDS,
  TEMPLATE_CONSULTIVA,
  type CalculatorInput,
  type NeedKey,
  type Prices,
  type SectionKey,
} from "./dataponto";

export type Proposal = {
  id: string;
  owner_id: string;
  public_token: string;
  number: number | null;
  company_name: string;
  cnpj: string | null;
  contact_name: string | null;
  contact_role: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  employees: number | null;
  need_key: string | null;
  problem_text: string | null;
  template: string;
  modality: "primme" | "compra";
  system_plan: "pro" | "ultimate" | "nenhum";
  licenses: number;
  device_qty: number;
  prices: Partial<Prices> | null;
  sections: Partial<Record<SectionKey, boolean>> | null;
  texts: Record<string, string> | null;
  calculator: Partial<CalculatorInput> | null;
  discount_reason: string | null;
  monthly_total: number;
  upfront_total: number;
  status: string;
  valid_until: string | null;
  notes: string | null;
  seller_name: string | null;
  seller_email: string | null;
  seller_phone: string | null;
  sent_at: string | null;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export const narrativeOf = (p: Pick<Proposal, "need_key">) =>
  NEEDS[(p.need_key as NeedKey) || "outro"] ?? NEEDS.outro;

export const pricesOf = (p: Pick<Proposal, "prices">): Prices => ({
  ...DEFAULT_PRICES,
  ...(p.prices ?? {}),
});

export const sectionsOf = (p: Pick<Proposal, "sections">): Record<SectionKey, boolean> => ({
  ...TEMPLATE_CONSULTIVA,
  ...(p.sections ?? {}),
});

export const calculatorOf = (p: Pick<Proposal, "calculator">): CalculatorInput => ({
  ...DEFAULT_CALCULATOR,
  ...(p.calculator ?? {}),
});

export const isExpired = (p: Pick<Proposal, "valid_until">) =>
  !!p.valid_until && new Date(`${p.valid_until}T23:59:59`) < new Date();
