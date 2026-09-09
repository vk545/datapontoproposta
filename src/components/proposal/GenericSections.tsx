import { ArrowRight, Check, LifeBuoy, ShieldCheck, Wrench } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/proposal/motion";
import { currency, type SectionKey } from "@/lib/dataponto";
import { flowFor, sectionContent } from "@/lib/sections-model";
import type { Proposal } from "@/lib/proposal";
import { groupByArea, type ProposalItem } from "@/lib/solutions";

type Ctx = {
  proposal: Proposal;
  items: ProposalItem[];
  areaCodes: string[];
  areaNames: Record<string, string>;
};

function Shell({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "institutional" | "surface";
}) {
  const toneClass =
    tone === "institutional"
      ? "surface-institutional text-institutional-foreground"
      : tone === "surface"
        ? "bg-surface text-foreground"
        : "bg-card text-foreground";
  return (
    <section className={`relative w-full overflow-hidden ${toneClass}`}>
      <div aria-hidden className="dp-grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--color-brand)]" />
      {children}
    </p>
  );
}

const areaLabelOf = (c: Ctx) =>
  c.areaCodes.map((code) => c.areaNames[code] ?? code).join(", ") || "a solução";

function Header({ ctx, sectionKey, eyebrow }: { ctx: Ctx; sectionKey: SectionKey; eyebrow: string }) {
  const { title, body } = sectionContent(ctx.proposal, sectionKey, areaLabelOf(ctx));
  return (
    <Reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl">{title}</h2>
      {body ? (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed opacity-80 [white-space:pre-line]">
          {body}
        </p>
      ) : null}
    </Reveal>
  );
}

/** Contexto / Problema */
export function ContextSection({ ctx }: { ctx: Ctx }) {
  return (
    <Shell tone="surface">
      <Header ctx={ctx} sectionKey="contexto" eyebrow="Contexto" />
      {ctx.proposal.problem_text ? (
        <Reveal>
          <div className="dp-glass mt-8 max-w-3xl rounded-2xl border border-border/60 p-6 text-sm leading-relaxed text-muted-foreground">
            {ctx.proposal.problem_text}
          </div>
        </Reveal>
      ) : null}
    </Shell>
  );
}

/** Solução proposta */
export function ProposedSolutionSection({ ctx }: { ctx: Ctx }) {
  const groups = [...groupByArea(ctx.items).entries()];
  return (
    <Shell tone="institutional">
      <div aria-hidden className="dp-aurora pointer-events-none absolute inset-0 opacity-40" />
      <Header ctx={ctx} sectionKey="solucao_proposta" eyebrow="Solução proposta" />
      {groups.length ? (
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
          {groups.map(([code, rows]) => (
            <StaggerItem key={code}>
              <div className="dp-glass-dark h-full rounded-2xl p-6">
                <p className="text-sm font-semibold text-brand">{ctx.areaNames[code] ?? code}</p>
                <ul className="mt-3 space-y-1.5 text-sm opacity-85">
                  {rows.map((r, i) => (
                    <li key={r.id ?? `${r.name}-${i}`}>
                      {r.quantity}× {r.name}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}
    </Shell>
  );
}

/** Como funciona — fluxo por categoria */
export function HowItWorksSection({ ctx }: { ctx: Ctx }) {
  const steps = flowFor(ctx.areaCodes);
  return (
    <Shell>
      <Header ctx={ctx} sectionKey="como_funciona" eyebrow="Como funciona" />
      <Stagger className="mt-10 flex flex-wrap items-stretch gap-3">
        {steps.map((s, i) => (
          <StaggerItem key={s}>
            <div className="flex items-center gap-3">
              <div className="dp-glass min-w-[150px] rounded-2xl border border-border/60 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                  Etapa {i + 1}
                </p>
                <p className="mt-1 text-sm font-medium">{s}</p>
              </div>
              {i < steps.length - 1 ? (
                <ArrowRight className="h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
              ) : null}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Shell>
  );
}

/** Composição da solução — itens selecionados */
export function CompositionSection({ ctx }: { ctx: Ctx }) {
  const groups = [...groupByArea(ctx.items).entries()];
  return (
    <Shell tone="surface">
      <Header ctx={ctx} sectionKey="composicao" eyebrow="Composição" />
      <div className="mt-10 space-y-8">
        {groups.map(([code, rows]) => (
          <Reveal key={code}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-institutional">
                {ctx.areaNames[code] ?? code}
              </p>
              <ul className="mt-4 divide-y divide-border">
                {rows.map((r, i) => (
                  <li
                    key={r.id ?? `${r.name}-${i}`}
                    className="flex items-center gap-4 py-3 text-sm"
                  >
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.name}
                        loading="lazy"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : null}
                    <span className="flex-1">
                      <span className="font-medium">{r.name}</span>
                      {r.description ? (
                        <span className="block text-xs text-muted-foreground">
                          {r.description}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground">{r.quantity}×</span>
                    <span className="font-medium">
                      {currency(Number(r.unit_price) * Number(r.quantity))}
                      {r.billing === "monthly" ? (
                        <span className="text-xs font-normal text-muted-foreground">/mês</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum produto selecionado nesta proposta ainda.
          </p>
        ) : null}
      </div>
    </Shell>
  );
}

const uniq = (v: string[]) => [...new Set(v.filter(Boolean))];

/** Recursos — características dos produtos selecionados */
export function FeaturesSection({ ctx }: { ctx: Ctx }) {
  const rows = ctx.items.filter((i) => i.features.length);
  return (
    <Shell tone="institutional">
      <Header ctx={ctx} sectionKey="recursos" eyebrow="Recursos" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {rows.map((it, idx) => (
          <Reveal key={it.id ?? `${it.name}-${idx}`}>
            <div className="dp-glass-dark h-full rounded-2xl p-6">
              <p className="text-sm font-semibold text-brand">{it.name}</p>
              <ul className="mt-3 space-y-2">
                {uniq(it.features).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm opacity-90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Shell>
  );
}

/** Benefícios */
export function BenefitsSection({ ctx }: { ctx: Ctx }) {
  const all = uniq(ctx.items.flatMap((i) => i.benefits));
  return (
    <Shell>
      <Header ctx={ctx} sectionKey="beneficios" eyebrow="Benefícios" />
      {all.length ? (
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
          {all.map((b) => (
            <StaggerItem key={b}>
              <div className="dp-glass h-full rounded-2xl border border-border/60 p-5 text-sm">
                {b}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : null}
    </Shell>
  );
}

const IMPLANT_STEPS = [
  "Levantamento e planejamento",
  "Instalação dos equipamentos",
  "Configuração e integração",
  "Testes e validação",
  "Treinamento da equipe",
];

/** Implantação */
export function DeploymentSection({ ctx }: { ctx: Ctx }) {
  return (
    <Shell tone="surface">
      <Header ctx={ctx} sectionKey="implantacao" eyebrow="Implantação" />
      <Stagger className="mt-10 grid gap-4 sm:grid-cols-5">
        {IMPLANT_STEPS.map((s, i) => (
          <StaggerItem key={s}>
            <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                Etapa {i + 1}
              </p>
              <p className="mt-2 text-sm font-medium">{s}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Shell>
  );
}

const DIFFERENTIALS = [
  { icon: LifeBuoy, title: "Suporte próprio", text: "Time técnico da Dataponto atendendo direto." },
  { icon: Wrench, title: "Manutenção", text: "Atendimento em campo e reposição quando necessário." },
  { icon: ShieldCheck, title: "Continuidade", text: "Operação protegida contra parada e imprevistos." },
];

/** Diferenciais / Proteção */
export function DifferentialsSection({ ctx }: { ctx: Ctx }) {
  return (
    <Shell tone="institutional">
      <div aria-hidden className="dp-aurora pointer-events-none absolute inset-0 opacity-30" />
      <Header ctx={ctx} sectionKey="diferenciais" eyebrow="Diferenciais" />
      <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
        {DIFFERENTIALS.map((d) => (
          <StaggerItem key={d.title}>
            <div className="dp-glass-dark h-full rounded-2xl p-6">
              <d.icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
              <p className="mt-3 text-sm font-semibold">{d.title}</p>
              <p className="mt-1.5 text-sm opacity-80">{d.text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Shell>
  );
}

/** Renderiza a seção genérica correspondente à chave, ou null. */
export function GenericSection({ sectionKey, ctx }: { sectionKey: SectionKey; ctx: Ctx }) {
  switch (sectionKey) {
    case "contexto":
      return <ContextSection ctx={ctx} />;
    case "solucao_proposta":
      return <ProposedSolutionSection ctx={ctx} />;
    case "como_funciona":
      return <HowItWorksSection ctx={ctx} />;
    case "composicao":
      return <CompositionSection ctx={ctx} />;
    case "recursos":
      return <FeaturesSection ctx={ctx} />;
    case "beneficios":
      return <BenefitsSection ctx={ctx} />;
    case "implantacao":
      return <DeploymentSection ctx={ctx} />;
    case "diferenciais":
      return <DifferentialsSection ctx={ctx} />;
    default:
      return null;
  }
}
