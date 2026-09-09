import {
  GENERIC_SECTIONS,
  PONTO_ONLY_SECTIONS,
  SECTION_LABELS,
  SECTION_ORDER,
  type SectionKey,
} from "./dataponto";
import { PONTO } from "./solutions";
import type { Proposal } from "./proposal";

/**
 * Registro único das seções da proposta.
 * A ordem vem de um array de dados (SECTION_ORDER), de modo que uma etapa
 * futura possa reordenar/arrastar sem refatorar os renderizadores.
 */
export type SectionKind = "fixed" | "text" | "derived";

export type SectionDef = {
  key: SectionKey;
  label: string;
  /** text = título/texto editáveis; derived = montada a partir dos produtos. */
  kind: SectionKind;
  /** true quando a seção só faz sentido com Controle de Ponto. */
  pontoOnly: boolean;
  /** true para as seções genéricas do modelo modular. */
  generic: boolean;
};

const KIND: Partial<Record<SectionKey, SectionKind>> = {
  contexto: "text",
  solucao_proposta: "text",
  como_funciona: "text",
  composicao: "derived",
  recursos: "derived",
  beneficios: "derived",
  implantacao: "text",
  diferenciais: "text",
  cta: "fixed",
};

export const SECTION_REGISTRY: SectionDef[] = SECTION_ORDER.map((key) => ({
  key,
  label: SECTION_LABELS[key],
  kind: KIND[key] ?? "fixed",
  pontoOnly: PONTO_ONLY_SECTIONS.includes(key),
  generic: GENERIC_SECTIONS.includes(key),
}));

export const sectionDef = (key: SectionKey) => SECTION_REGISTRY.find((s) => s.key === key);

/** Fluxo "Como funciona" por categoria. */
export const AREA_FLOWS: Record<string, string[]> = {
  ponto: ["Registro", "Identificação", "Validação", "Coleta", "Tratamento na gestão"],
  acesso: ["Identificação", "Validação", "Autorização", "Liberação", "Registro"],
  veiculos: [
    "Veículo chega",
    "Identificação",
    "Validação",
    "Autorização",
    "Acesso liberado",
    "Registro",
  ],
  monitoramento: ["Captura", "Transmissão", "Gravação", "Visualização", "Consulta"],
};

export const flowFor = (areaCodes: string[]): string[] => {
  const primary = areaCodes.find((c) => AREA_FLOWS[c]) ?? PONTO;
  return AREA_FLOWS[primary] ?? AREA_FLOWS[PONTO]!;
};

/** Conteúdo sugerido de cada seção de texto, conforme as soluções da proposta. */
export function defaultContent(
  key: SectionKey,
  ctx: { areaLabel: string; company: string },
): { title: string; body: string } {
  const s = ctx.areaLabel;
  switch (key) {
    case "contexto":
      return {
        title: "O cenário atual",
        body: `Antes de falar de equipamento ou de preço, é importante entender o cenário da ${ctx.company}: onde o processo atual gera retrabalho, insegurança ou perda de controle no dia a dia.`,
      };
    case "solucao_proposta":
      return {
        title: "A solução para a sua empresa",
        body: `A proposta reúne ${s} em uma solução única, dimensionada para a realidade da operação e pensada para entregar controle imediato, sem complexidade de implantação.`,
      };
    case "como_funciona":
      return {
        title: "Como a solução funciona",
        body: "Cada etapa acontece em segundos e fica registrada, garantindo rastreabilidade completa de tudo que passa pela operação.",
      };
    case "composicao":
      return {
        title: "Composição da solução",
        body: "Tudo que faz parte desta proposta, item a item.",
      };
    case "recursos":
      return {
        title: "Recursos",
        body: "Os recursos disponíveis nos equipamentos e sistemas selecionados.",
      };
    case "beneficios":
      return {
        title: "Benefícios",
        body: "O que muda na prática depois da implantação.",
      };
    case "implantacao":
      return {
        title: "Como será a implantação",
        body: "Planejamento, instalação, configuração, testes e treinamento da equipe. Acompanhamos cada etapa até a solução estar em pleno funcionamento.",
      };
    case "diferenciais":
      return {
        title: "Diferenciais e proteção",
        body: "Suporte técnico próprio, manutenção, reposição, atualização e continuidade da operação — a Dataponto acompanha o cliente depois da venda.",
      };
    default:
      return { title: SECTION_LABELS[key], body: "" };
  }
}

export const titleKey = (key: SectionKey) => `sec_${key}_title`;
export const bodyKey = (key: SectionKey) => `sec_${key}_body`;

export function sectionContent(
  p: Pick<Proposal, "texts" | "company_name">,
  key: SectionKey,
  areaLabel: string,
) {
  const texts = p.texts ?? {};
  const fallback = defaultContent(key, { areaLabel, company: p.company_name || "sua empresa" });
  return {
    title: texts[titleKey(key)]?.trim() || fallback.title,
    body: texts[bodyKey(key)]?.trim() || fallback.body,
  };
}

/**
 * Seções recomendadas para as categorias escolhidas.
 * As seções genéricas entram quando existe alguma solução fora do Controle de Ponto;
 * propostas só de ponto continuam com a narrativa clássica.
 */
export function recommendedSections(
  base: Record<SectionKey, boolean>,
  areaCodes: string[],
): Record<SectionKey, boolean> {
  const ponto = areaCodes.includes(PONTO);
  const others = areaCodes.some((c) => c !== PONTO);
  const out = { ...base } as Record<SectionKey, boolean>;
  for (const def of SECTION_REGISTRY) {
    if (def.pontoOnly && !ponto) out[def.key] = false;
    if (def.generic) out[def.key] = others;
  }
  out.capa = true;
  out.investimento = true;
  out.cta = true;
  if (others && !ponto) out.problema = false;
  return out;
}
