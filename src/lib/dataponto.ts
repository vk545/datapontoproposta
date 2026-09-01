export type NeedKey =
  | "fraudes"
  | "filas"
  | "modernizar"
  | "substituir"
  | "operacional"
  | "rh"
  | "jornada"
  | "seguranca"
  | "manutencao"
  | "gestao"
  | "automatizar"
  | "outro";

export type Narrative = {
  label: string;
  subtitle: string;
  problems: string[];
  highlights: string[];
  recommend: { modality: "primme" | "compra"; plan: "pro" | "ultimate" };
};

export const NEEDS: Record<NeedKey, Narrative> = {
  fraudes: {
    label: "Reduzir fraudes no registro de ponto",
    subtitle: "Mais segurança nos registros. Cada ponto associado a uma identidade.",
    problems: [
      "Quando o registro depende de senha, cartão ou identificação manual, existe espaço para registros realizados por terceiros.",
      "Registros contestados geram conferência, retrabalho e desgaste entre RH e operação.",
      "Sem identificação individual, a apuração da jornada depende de confiança e não de evidência.",
    ],
    highlights: [
      "Reconhecimento facial com identificação individual",
      "Redução da possibilidade de um colaborador registrar pelo outro",
      "Registros mais confiáveis para a apuração da jornada",
      "Comprovante digital enviado ao colaborador",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
  filas: {
    label: "Reduzir filas",
    subtitle: "Mais agilidade nos horários de pico da sua operação.",
    problems: [
      "Em operações com grande fluxo de colaboradores, alguns minutos de espera podem se acumular ao longo do mês.",
      "Filas em entrada, intervalo e saída concentram pessoas e atrasam o início das atividades.",
      "Equipamentos lentos ou com leitura instável aumentam o tempo de cada registro.",
    ],
    highlights: [
      "Reconhecimento facial rápido, sem contato",
      "Tela touch com resposta imediata",
      "Registro sem depender de cartão ou digitação",
      "Potencial redução do tempo de espera nos horários de pico",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
  modernizar: {
    label: "Modernizar o controle de ponto",
    subtitle: "Um controle de ponto à altura da sua operação atual.",
    problems: [
      "Processos apoiados em papel e conferência manual limitam a visão da jornada.",
      "Equipamentos antigos costumam depender de rotinas manuais de coleta.",
      "Sem integração com um sistema de gestão, os dados ficam parados no equipamento.",
    ],
    highlights: [
      "Equipamento facial com comprovante digital",
      "Integração com sistema de gestão de ponto",
      "Acesso às informações pelo navegador",
      "Registros disponíveis para acompanhamento contínuo",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
  substituir: {
    label: "Substituir equipamento antigo",
    subtitle: "Substituição planejada, com configuração e cadastro feitos antes do envio.",
    problems: [
      "Equipamentos em fim de vida útil podem apresentar indisponibilidade e necessidade frequente de manutenção.",
      "Trocas sem preparação prévia interrompem a rotina de registro.",
      "Peças e assistência de equipamentos antigos tendem a ficar mais difíceis com o tempo.",
    ],
    highlights: [
      "Equipamento novo pré-configurado antes do envio",
      "Cadastro remoto dos colaboradores",
      "Manutenção, peças e mão de obra na modalidade Comodato",
      "Baixa necessidade de manutenção",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
  operacional: {
    label: "Reduzir problemas operacionais",
    subtitle: "Menos etapas manuais entre o registro e a gestão.",
    problems: [
      "Quando o processo depende de conferências e correções manuais, o RH pode gastar tempo que poderia ser direcionado a atividades mais estratégicas.",
      "Falhas de leitura e registros duplicados geram ajustes ao longo do mês.",
      "A dependência de rotinas manuais concentra conhecimento em poucas pessoas.",
    ],
    highlights: [
      "Registro digital direto no sistema",
      "Menos etapas manuais entre coleta e apuração",
      "Relatórios para acompanhamento da jornada",
      "Suporte e treinamento na implantação",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
  rh: {
    label: "Facilitar o trabalho do RH",
    subtitle: "Do registro à gestão, sem etapas desnecessárias para o RH.",
    problems: [
      "Quando o processo depende de conferências e correções manuais, o RH pode gastar tempo que poderia ser direcionado a atividades mais estratégicas.",
      "Informações espalhadas entre planilhas, e-mails e documentos dificultam a auditoria.",
      "Solicitações de colaboradores chegam por canais diferentes e sem histórico.",
    ],
    highlights: [
      "Relatórios e dashboards de acompanhamento",
      "Gestão de férias e gestão documental",
      "Auditoria por IA",
      "Aplicativo do colaborador",
    ],
    recommend: { modality: "primme", plan: "ultimate" },
  },
  jornada: {
    label: "Melhorar o controle da jornada",
    subtitle: "Visão contínua da jornada, e não apenas no fechamento do mês.",
    problems: [
      "Sem acompanhamento contínuo, desvios de jornada aparecem somente no fechamento.",
      "Equipes externas ou em campo dificultam a consolidação dos registros.",
      "Ajustes concentrados no fim do mês aumentam a pressão sobre o RH.",
    ],
    highlights: [
      "Acompanhamento da jornada pelo navegador",
      "Registro mobile com geolocalização e foto",
      "Relatórios de ocorrências",
      "Aplicativo do colaborador",
    ],
    recommend: { modality: "primme", plan: "ultimate" },
  },
  seguranca: {
    label: "Ter mais segurança nos registros",
    subtitle: "Registros associados à identidade de cada colaborador.",
    problems: [
      "Identificação por senha ou cartão não vincula o registro à pessoa.",
      "Registros sem comprovante dificultam a comprovação posterior.",
      "Dados isolados no equipamento aumentam o risco de perda de informação.",
    ],
    highlights: [
      "Reconhecimento facial",
      "Comprovante digital por e-mail",
      "Registros enviados ao sistema de gestão",
      "Operação offline com continuidade do registro",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
  manutencao: {
    label: "Ter manutenção e suporte contínuos",
    subtitle: "O equipamento é o início. A operação precisa continuar funcionando.",
    problems: [
      "Uma parada no equipamento interrompe o registro de toda a operação.",
      "Manutenções avulsas envolvem orçamento, peça, deslocamento e tempo.",
      "Sem treinamento contínuo, a equipe depende de tentativa e erro.",
    ],
    highlights: [
      "Comodato: manutenção, peças e mão de obra",
      "Suporte e treinamento",
      "Visitas técnicas na Grande São Paulo",
      "Continuidade da operação após a implantação",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
  gestao: {
    label: "Implantar sistema de gestão",
    subtitle: "Registros transformados em gestão da jornada.",
    problems: [
      "Registros que não chegam a um sistema viram apenas arquivos.",
      "Sem sistema, cada relatório é montado manualmente.",
      "A informação demora a chegar a quem toma decisão.",
    ],
    highlights: [
      "Acesso via navegador",
      "Relatórios e acompanhamento da jornada",
      "Registro mobile com geolocalização e foto",
      "Aplicativo do colaborador",
    ],
    recommend: { modality: "primme", plan: "ultimate" },
  },
  automatizar: {
    label: "Automatizar processos do RH",
    subtitle: "Menos tarefas repetitivas, mais tempo para o que é estratégico.",
    problems: [
      "Tarefas repetitivas de conferência consomem horas do time todo mês.",
      "Controles paralelos em planilhas se desatualizam rapidamente.",
      "Processos manuais dificultam padronizar a rotina entre unidades.",
    ],
    highlights: [
      "Auditoria por IA",
      "Gestão de férias e de arquivos",
      "Dashboards adicionais",
      "Aplicativo do colaborador",
    ],
    recommend: { modality: "primme", plan: "ultimate" },
  },
  outro: {
    label: "Outro",
    subtitle: "Uma solução construída a partir do cenário da sua operação.",
    problems: [
      "Cada operação tem um ponto de atenção diferente no controle de jornada.",
      "Quando o processo depende de etapas manuais, o tempo do time é consumido em conferência.",
    ],
    highlights: [
      "Reconhecimento facial",
      "Sistema de gestão de ponto",
      "Implantação com configuração e treinamento",
      "Continuidade com suporte e manutenção",
    ],
    recommend: { modality: "primme", plan: "pro" },
  },
};

export const NEED_OPTIONS = (Object.keys(NEEDS) as NeedKey[]).map((k) => ({
  value: k,
  label: NEEDS[k].label,
}));

export type Prices = {
  equipment: number;
  primme: number;
  pro: number;
  ultimate: number;
};

export const DEFAULT_PRICES: Prices = { equipment: 1020, primme: 58, pro: 73, ultimate: 86 };

export type SectionKey =
  | "capa"
  | "problema"
  | "impacto"
  | "calculadora"
  | "solucao"
  | "relogio"
  | "sistema"
  | "comparacao"
  | "implementacao"
  | "protecao"
  | "modalidade"
  | "completa"
  | "investimento"
  | "cta";

export const SECTION_LABELS: Record<SectionKey, string> = {
  capa: "Capa",
  problema: "O problema",
  impacto: "Impacto",
  calculadora: "Calculadora de impacto",
  solucao: "A solução",
  relogio: "Relógio de ponto facial",
  sistema: "Sistema de gestão",
  comparacao: "Comparação Pro x Ultimate",
  implementacao: "Implementação",
  protecao: "Proteção e continuidade",
  modalidade: "Compra x Comodato",
  completa: "A solução completa",
  investimento: "Investimento",
  cta: "Próximo passo",
};

export const SECTION_ORDER: SectionKey[] = [
  "capa",
  "problema",
  "impacto",
  "calculadora",
  "solucao",
  "relogio",
  "sistema",
  "comparacao",
  "implementacao",
  "protecao",
  "modalidade",
  "completa",
  "investimento",
  "cta",
];

export const TEMPLATE_CONSULTIVA: Record<SectionKey, boolean> = {
  capa: true,
  problema: true,
  impacto: true,
  calculadora: false,
  solucao: true,
  relogio: true,
  sistema: true,
  comparacao: true,
  implementacao: true,
  protecao: true,
  modalidade: true,
  completa: true,
  investimento: true,
  cta: true,
};

export const TEMPLATE_ESSENCIAL: Record<SectionKey, boolean> = {
  capa: true,
  problema: false,
  impacto: false,
  calculadora: false,
  solucao: true,
  relogio: true,
  sistema: false,
  comparacao: false,
  implementacao: false,
  protecao: false,
  modalidade: false,
  completa: false,
  investimento: true,
  cta: true,
};

export type CalculatorInput = {
  enabled?: boolean;
  employees: number;
  salary: number;
  days: number;
  waitMinutes: number;
  recordsPerDay: number;
};

export const DEFAULT_CALCULATOR: CalculatorInput = {
  employees: 50,
  salary: 2400,
  days: 22,
  waitMinutes: 2,
  recordsPerDay: 2,
};

export function calcImpact(input: CalculatorInput) {
  const minutesPerDay = input.employees * input.waitMinutes * input.recordsPerDay;
  const minutesPerMonth = minutesPerDay * input.days;
  const hoursPerMonth = minutesPerMonth / 60;
  const hourCost = input.salary > 0 ? input.salary / (input.days * 8 || 1) / 1 : 0;
  const estimatedCost = (hourCost / 1) * hoursPerMonth;
  return {
    minutesPerDay,
    minutesPerMonth,
    hoursPerMonth,
    hoursPerYear: hoursPerMonth * 12,
    estimatedCost,
  };
}

export type PricingInput = {
  modality: "primme" | "compra";
  plan: "pro" | "ultimate" | "nenhum";
  deviceQty: number;
  prices: Prices;
};

export function calcInvestment({ modality, plan, deviceQty, prices }: PricingInput) {
  const qty = Math.max(1, deviceQty || 1);
  const primme = modality === "primme" ? prices.primme * qty : 0;
  const system = plan === "pro" ? prices.pro : plan === "ultimate" ? prices.ultimate : 0;
  const upfront = modality === "compra" ? prices.equipment * qty : 0;
  return { primme, system, monthly: primme + system, upfront };
}

export const currency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number.isFinite(v) ? v : 0,
  );

export const numberBR = (v: number, digits = 0) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(
    Number.isFinite(v) ? v : 0,
  );

export const dateBR = (v?: string | null) =>
  v ? new Date(v.length <= 10 ? `${v}T12:00:00` : v).toLocaleDateString("pt-BR") : "—";

export const PRO_FEATURES = [
  "Acesso via navegador",
  "Relatórios",
  "Registro de ponto pelo celular",
  "Geolocalização",
  "Foto no registro",
  "Aplicativo para colaboradores",
];

export const ULTIMATE_ONLY = [
  "Gestão de férias",
  "Gestão de arquivos",
  "Auditoria por IA",
  "Dashboards adicionais",
  "Celular ou tablet como relógio de ponto universal",
];

export const EQUIPMENT_FEATURES: { spec: string; meaning: string }[] = [
  {
    spec: "Reconhecimento facial",
    meaning:
      "Cada colaborador registra o próprio ponto por meio da identificação facial, reduzindo significativamente a possibilidade de registros realizados por terceiros.",
  },
  {
    spec: "Operação offline",
    meaning: "O equipamento continua registrando mesmo sem depender de conexão constante.",
  },
  {
    spec: "Tela touch",
    meaning: "A interação é direta, o que ajuda a tornar cada registro mais rápido.",
  },
  {
    spec: "Wi-Fi",
    meaning: "Facilita a comunicação do equipamento com a estrutura da empresa.",
  },
  {
    spec: "Até 5.000 faces",
    meaning: "Capacidade compatível com operações que crescem ao longo do tempo.",
  },
  {
    spec: "Comprovante digital por e-mail",
    meaning: "Reduz a necessidade de utilização de papel na rotina de registro.",
  },
];

export const IMPLEMENTATION_STEPS = [
  { n: "01", title: "Configuração", text: "O equipamento é configurado antes de sair." },
  { n: "02", title: "Integração", text: "Integração com o sistema de gestão realizada previamente." },
  { n: "03", title: "Cadastro remoto", text: "Cadastro dos colaboradores feito remotamente." },
  { n: "04", title: "Preparação", text: "Equipamento preparado e testado para envio." },
  { n: "05", title: "Envio", text: "São Paulo: até 5 dias úteis. Fora do estado: até 7 dias úteis." },
  { n: "06", title: "Treinamento", text: "Treinamento gratuito, agendado conforme a disponibilidade." },
  { n: "07", title: "Operação", text: "Operação assistida com suporte da Dataponto." },
];

export const PRIMME_INCLUDES = [
  "Equipamento",
  "Suporte",
  "Treinamento",
  "Mão de obra",
  "Peças",
  "Manutenção",
  "Visitas na Grande São Paulo",
  "Assistência",
];

export const STATUSES = [
  "rascunho",
  "enviada",
  "visualizada",
  "aprovada",
  "recusada",
  "expirada",
] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  visualizada: "Visualizada",
  aprovada: "Aprovada",
  recusada: "Recusada",
  expirada: "Expirada",
};
