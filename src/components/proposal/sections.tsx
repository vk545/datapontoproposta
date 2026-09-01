import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  Check,
  Clock,
  Cpu,
  Fingerprint,
  Gauge,
  LifeBuoy,
  Mail,
  MonitorSmartphone,
  Phone,
  ScanFace,
  ShieldCheck,
  Smartphone,
  Truck,
  Wifi,
  Wrench,
} from "lucide-react";
import relogioImg from "@/assets/relogio-tech.png";
import techBg from "@/assets/tech-bg.jpg";
import { BrandLogo, ProductImage } from "@/lib/brand";
import {
  EQUIPMENT_FEATURES,
  IMPLEMENTATION_STEPS,
  PRIMME_INCLUDES,
  PRO_FEATURES,
  ULTIMATE_ONLY,
  calcImpact,
  calcInvestment,
  currency,
  dateBR,
  numberBR,
} from "@/lib/dataponto";
import { calculatorOf, narrativeOf, pricesOf, type Proposal } from "@/lib/proposal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Section({
  children,
  tone = "light",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "light" | "institutional" | "surface";
  className?: string;
}) {
  const toneClass =
    tone === "institutional"
      ? "surface-institutional"
      : tone === "surface"
        ? "bg-surface text-foreground"
        : "bg-card text-foreground";
  return (
    <section className={`relative w-full overflow-hidden ${toneClass} ${className}`}>
      {tone === "institutional" ? (
        <div aria-hidden className="tech-grid pointer-events-none absolute inset-0 opacity-60" />
      ) : null}
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

export function buildSections(p: Proposal, opts?: { publicView?: boolean }) {
  const n = narrativeOf(p);
  const prices = pricesOf(p);
  const inv = calcInvestment({
    modality: p.modality,
    plan: p.system_plan,
    deviceQty: p.device_qty,
    prices,
  });
  const texts = p.texts ?? {};
  const publicView = opts?.publicView ?? false;

  const items: { key: string; node: React.ReactNode }[] = [];

  items.push({
    key: "capa",
    node: (
      <Section tone="institutional" className="relative overflow-hidden">
        <img
          src={techBg}
          alt=""
          aria-hidden
          width={1920}
          height={1088}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="relative grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <BrandLogo className="mb-8 brightness-0 invert" />
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">
              <span className="relative flex h-1.5 w-1.5">
                <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-brand" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              Proposta personalizada
            </p>
            <p className="mt-7 text-sm uppercase tracking-[0.18em] text-institutional-foreground/60">
              Preparada para
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{p.company_name || "—"}</h2>
            <h1 className="text-gradient-brand mt-7 text-4xl font-semibold leading-[1.08] text-balance-tight sm:text-5xl">
              {texts['cover_title'] || "Controle de ponto pensado para a sua operação."}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-institutional-foreground/80">
              {texts['cover_subtitle'] || n.subtitle}
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Data", dateBR(p.created_at)],
                ["Consultor", p.seller_name || "—"],
                ...(p.valid_until
                  ? ([["Válida até", dateBR(p.valid_until)]] as [string, string][])
                  : []),
              ].map(([label, value]) => (
                <div key={label} className="glass-dark rounded-xl px-4 py-3">
                  <span className="block text-[10px] uppercase tracking-widest text-institutional-foreground/60">
                    {label}
                  </span>
                  <span className="text-sm text-institutional-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-6 -z-10 rounded-full bg-brand/25 blur-3xl" />
            <div
              aria-hidden
              className="pulse-ring absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/40"
            />
            <ProductImage
              code="relogio_facial"
              fallback={relogioImg}
              alt="Relógio de ponto facial Dataponto"
              eager
              className="mx-auto w-full max-w-sm drop-shadow-2xl"
            />
          </div>
        </div>
      </Section>
    ),

  });

  items.push({
    key: "problema",
    node: (
      <Section>
        <Eyebrow>Contexto</Eyebrow>
        <h2 className="max-w-3xl text-3xl font-semibold text-balance-tight sm:text-4xl">
          O que está por trás de um simples registro de ponto?
        </h2>
        {p.problem_text ? (
          <div className="mt-8 rounded-xl border border-border bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cenário relatado
            </p>
            <p className="mt-2 text-lg leading-relaxed">{p.problem_text}</p>
          </div>
        ) : null}
        <div className="mt-10 space-y-5">
          {n.problems.map((t, i) => (
            <div key={i} className="flex gap-4 border-l-2 border-brand/40 pl-5">
              <p className="text-lg leading-relaxed text-muted-foreground">{t}</p>
            </div>
          ))}
        </div>
      </Section>
    ),
  });

  items.push({
    key: "impacto",
    node: (
      <Section tone="surface">
        <Eyebrow>Impacto</Eyebrow>
        <h2 className="max-w-3xl text-3xl font-semibold text-balance-tight sm:text-4xl">
          Pequenos problemas podem gerar grandes impactos.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-4">
          {[
            { t: "Problema", d: "Uma etapa que depende de conferência ou espera.", i: Gauge },
            { t: "Tempo", d: "Minutos que se repetem todos os dias.", i: Clock },
            { t: "Retrabalho", d: "Ajustes manuais e conferências no fechamento.", i: Wrench },
            { t: "Custo operacional", d: "Horas da equipe direcionadas à correção.", i: Building2 },
          ].map((s, idx) => (
            <div
              key={s.t}
              className="glass-card rounded-2xl p-6"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <s.i className="h-5 w-5 text-brand" strokeWidth={1.75} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-institutional">
                {s.t}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          As referências acima são ilustrativas e não representam garantia de economia.
        </p>
      </Section>
    ),
  });

  items.push({
    key: "calculadora",
    node: <CalculatorSection proposal={p} interactive={!publicView} />,
  });

  items.push({
    key: "solucao",
    node: (
      <Section>
        <Eyebrow>Solução</Eyebrow>
        <h2 className="max-w-3xl text-3xl font-semibold text-balance-tight sm:text-4xl">
          Uma solução pensada para eliminar etapas desnecessárias.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {n.highlights.map((h) => (
            <div
              key={h}
              className="flex items-start gap-3 glass-card rounded-2xl p-5"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
              <p className="text-base leading-relaxed">{h}</p>
            </div>
          ))}
        </div>
      </Section>
    ),
  });

  items.push({
    key: "relogio",
    node: (
      <Section tone="institutional">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-brand/15 blur-3xl" />
            <ProductImage
              code="relogio_facial"
              fallback={relogioImg}
              alt="Relógio de ponto facial"
              className="mx-auto w-full max-w-xs drop-shadow-2xl"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              Equipamento
            </p>
            <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Relógio de ponto facial</h2>
            <p className="mt-4 text-institutional-foreground/80">
              Cada característica existe para simplificar uma etapa da rotina de registro.
            </p>
            <dl className="mt-8 space-y-5">
              {EQUIPMENT_FEATURES.map((f) => (
                <div key={f.spec} className="border-t border-white/10 pt-4">
                  <dt className="flex items-center gap-2 text-sm font-semibold">
                    <ScanFace className="h-4 w-4 text-brand" strokeWidth={1.75} />
                    {f.spec}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-institutional-foreground/75">
                    {f.meaning}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>
    ),
  });

  items.push({
    key: "sistema",
    node: (
      <Section>
        <Eyebrow>Gestão</Eyebrow>
        <h2 className="max-w-3xl text-3xl font-semibold text-balance-tight sm:text-4xl">
          O relógio registra. O sistema transforma os registros em gestão.
        </h2>
        <div className="mt-12 grid gap-3 sm:grid-cols-4">
          {[
            { t: "Relógio", i: Fingerprint },
            { t: "Registros", i: Cpu },
            { t: "Sistema", i: MonitorSmartphone },
            { t: "Gestão", i: Gauge },
          ].map((s, i) => (
            <div key={s.t} className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 glass-card rounded-2xl px-5 py-4">
                <s.i className="h-5 w-5 text-brand" strokeWidth={1.75} />
                <span className="text-sm font-semibold">{s.t}</span>
              </div>
              {i < 3 ? (
                <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            "Acesso pelo navegador, sem instalação local",
            "Relatórios e acompanhamento da jornada",
            "Registro mobile com geolocalização e foto",
            "Aplicativo do colaborador",
          ].map((t) => (
            <div key={t} className="flex items-start gap-3">
              <Check className="mt-1 h-4 w-4 shrink-0 text-brand" strokeWidth={2.25} />
              <p className="text-base text-muted-foreground">{t}</p>
            </div>
          ))}
        </div>
      </Section>
    ),
  });

  items.push({
    key: "comparacao",
    node: (
      <Section tone="surface">
        <Eyebrow>Sistema de gestão</Eyebrow>
        <h2 className="text-3xl font-semibold sm:text-4xl">Secullum RH Pro e Ultimate</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A recomendação depende da profundidade de gestão que o RH precisa hoje.
        </p>
        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] border-b border-border bg-institutional-soft px-6 py-4 text-sm font-semibold text-institutional">
            <span>Recurso</span>
            <span className="text-center">Pro</span>
            <span className="text-center">Ultimate</span>
          </div>
          {[
            ...PRO_FEATURES.map((f) => ({ f, pro: true })),
            ...ULTIMATE_ONLY.map((f) => ({ f, pro: false })),
          ].map((row) => (
            <div
              key={row.f}
              className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center border-b border-border px-6 py-3.5 text-sm last:border-0"
            >
              <span>{row.f}</span>
              <span className="flex justify-center">
                {row.pro ? (
                  <Check className="h-4 w-4 text-brand" strokeWidth={2.5} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
              <span className="flex justify-center">
                <Check className="h-4 w-4 text-brand" strokeWidth={2.5} />
              </span>
            </div>
          ))}
          <div className="grid grid-cols-[1.6fr_0.7fr_0.7fr] items-center bg-surface px-6 py-4 text-sm font-semibold">
            <span>Mensalidade</span>
            <span className="text-center">{currency(prices.pro)}</span>
            <span className="text-center">{currency(prices.ultimate)}</span>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-brand/30 bg-brand-soft px-6 py-5">
          <p className="text-base font-medium text-institutional">
            Diferença de {currency(prices.ultimate - prices.pro)} por mês entre os planos. Por esse
            valor, a empresa amplia significativamente a capacidade de gestão.
          </p>
        </div>
      </Section>
    ),
  });

  items.push({
    key: "implementacao",
    node: (
      <Section>
        <Eyebrow>Implementação</Eyebrow>
        <h2 className="max-w-3xl text-3xl font-semibold text-balance-tight sm:text-4xl">
          Você não recebe apenas uma caixa. Nós preparamos a solução.
        </h2>
        <ol className="mt-12 space-y-0">
          {IMPLEMENTATION_STEPS.map((s) => (
            <li key={s.n} className="relative flex gap-6 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 bg-brand-soft text-xs font-semibold text-institutional">
                  {s.n}
                </span>
                <span className="mt-1 w-px flex-1 bg-border last:hidden" />
              </div>
              <div className="pt-1">
                <p className="font-semibold text-institutional">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-border p-5">
            <Truck className="mt-0.5 h-5 w-5 text-brand" strokeWidth={1.75} />
            <p className="text-sm text-muted-foreground">
              São Paulo: até 5 dias úteis. Fora do estado: até 7 dias úteis para chegada.
            </p>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border p-5">
            <CalendarClock className="mt-0.5 h-5 w-5 text-brand" strokeWidth={1.75} />
            <p className="text-sm text-muted-foreground">
              Treinamento gratuito, agendado de acordo com a disponibilidade da sua equipe.
            </p>
          </div>
        </div>
      </Section>
    ),
  });

  items.push({
    key: "protecao",
    node: (
      <Section tone="institutional">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Continuidade</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold text-balance-tight sm:text-4xl">
          Você não fica sozinho depois da compra.
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-institutional-foreground/80">
          O equipamento é apenas o início. A operação precisa continuar funcionando.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { t: "Suporte e treinamento", i: LifeBuoy },
            { t: "Manutenção, peças e mão de obra", i: Wrench },
            { t: "Visitas técnicas na Grande São Paulo", i: ShieldCheck },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-white/10 bg-white/5 p-6">
              <c.i className="h-5 w-5 text-brand" strokeWidth={1.75} />
              <p className="mt-4 text-base font-medium">{c.t}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          {PRIMME_INCLUDES.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-institutional-foreground/85"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="mt-8 text-sm text-institutional-foreground/60">
          Manutenção preventiva e corretiva conforme as condições contratadas. Consulte as condições
          contratuais completas.
        </p>
      </Section>
    ),
  });

  items.push({
    key: "modalidade",
    node: (
      <Section tone="surface">
        <Eyebrow>Modalidades</Eyebrow>
        <h2 className="text-3xl font-semibold sm:text-4xl">Compra ou Primme</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div
            className={`rounded-xl border bg-card p-7 shadow-soft ${p.modality === "compra" ? "border-brand" : "border-border"}`}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-institutional">
              Compra
            </p>
            <p className="mt-3 text-3xl font-semibold">{currency(prices.equipment)}</p>
            <p className="text-sm text-muted-foreground">à vista, por equipamento</p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              {[
                "O cliente é proprietário do equipamento",
                "Pode utilizar com a Dataponto ou com sistema compatível próprio",
                "Serviços adicionais são opcionais",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.25} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`rounded-xl border bg-card p-7 shadow-soft ${p.modality === "primme" ? "border-brand" : "border-border"}`}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-institutional">
              Primme
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {currency(prices.primme)}
              <span className="text-base font-normal text-muted-foreground">/mês</span>
            </p>
            <p className="text-sm text-muted-foreground">equipamento + continuidade + proteção</p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              {PRIMME_INCLUDES.map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2.25} />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Sem multa de fidelidade. Cancelamento antes de 12 meses: devolução do equipamento.
              Após 12 meses, conforme condições contratuais, o cliente pode permanecer com o
              equipamento. Consulte as condições contratuais completas.
            </p>
          </div>
        </div>
      </Section>
    ),
  });

  items.push({
    key: "completa",
    node: (
      <Section>
        <Eyebrow>Resumo</Eyebrow>
        <h2 className="text-3xl font-semibold sm:text-4xl">Uma solução completa de controle de ponto</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Equipamento", d: "Relógio facial", i: ScanFace },
            { t: "Gestão", d: "Sistema Dataponto / Secullum", i: MonitorSmartphone },
            { t: "Implementação", d: "Configuração, integração e treinamento", i: Wrench },
            { t: "Proteção", d: "Primme, suporte e manutenção", i: ShieldCheck },
          ].map((c) => (
            <div key={c.t} className="glass-card rounded-2xl p-6">
              <c.i className="h-5 w-5 text-brand" strokeWidth={1.75} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-institutional">
                {c.t}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>
    ),
  });

  items.push({
    key: "investimento",
    node: (
      <Section tone="institutional">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">Investimento</p>
        <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
          O investimento para colocar essa solução em operação
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-0 rounded-xl border border-white/10 bg-white/5 p-2">
            {[
              {
                l: "Equipamento",
                v:
                  p.modality === "compra"
                    ? `${currency(prices.equipment)} à vista`
                    : "Incluso no Primme",
              },
              { l: "Modalidade", v: p.modality === "primme" ? "Primme" : "Compra" },
              {
                l: "Sistema",
                v:
                  p.system_plan === "nenhum"
                    ? "Não incluído"
                    : p.system_plan === "pro"
                      ? "Secullum RH Pro"
                      : "Secullum RH Ultimate",
              },
              { l: "Equipamentos", v: `${p.device_qty}` },
              { l: "Licenças", v: `${p.licenses} colaboradores` },
            ].map((r) => (
              <div
                key={r.l}
                className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-sm last:border-0"
              >
                <span className="text-institutional-foreground/70">{r.l}</span>
                <span className="font-medium">{r.v}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-brand/40 bg-brand/10 p-7">
            <p className="text-xs uppercase tracking-widest text-institutional-foreground/70">
              Total mensal
            </p>
            <p className="mt-1 text-4xl font-semibold text-brand">{currency(inv.monthly)}</p>
            <p className="mt-6 text-xs uppercase tracking-widest text-institutional-foreground/70">
              Investimento inicial
            </p>
            <p className="mt-1 text-2xl font-semibold">{currency(inv.upfront)}</p>
            {p.discount_reason ? (
              <p className="mt-6 text-xs text-institutional-foreground/60">
                Condição comercial específica aplicada a esta proposta.
              </p>
            ) : null}
          </div>
        </div>
      </Section>
    ),
  });

  items.push({
    key: "cta",
    node: (
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-balance-tight sm:text-4xl">
            Pronto para transformar o controle de ponto da sua empresa?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Uma solução pensada para tornar sua operação mais segura, ágil e simples de administrar.
          </p>
          <div className="mt-10 glass-card rounded-2xl p-7 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Seu consultor
            </p>
            <p className="mt-2 text-lg font-semibold text-institutional">{p.seller_name || "—"}</p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.seller_phone ? (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand" strokeWidth={1.75} />
                  {p.seller_phone}
                </p>
              ) : null}
              {p.seller_email ? (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand" strokeWidth={1.75} />
                  {p.seller_email}
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-brand" strokeWidth={1.75} />
                Dataponto
              </p>
            </div>
          </div>
        </div>
      </Section>
    ),
  });

  return items;
}

export function CalculatorSection({
  proposal,
  interactive,
}: {
  proposal: Proposal;
  interactive: boolean;
}) {
  const [input, setInput] = useState(calculatorOf(proposal));
  const result = useMemo(() => calcImpact(input), [input]);
  const set = (k: keyof typeof input) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInput({ ...input, [k]: Number(e.target.value) });

  return (
    <Section tone="surface">
      <Eyebrow>Simulação</Eyebrow>
      <h2 className="text-3xl font-semibold sm:text-4xl">Calculadora de impacto operacional</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { k: "employees", l: "Colaboradores" },
            { k: "salary", l: "Salário médio (R$)" },
            { k: "days", l: "Dias trabalhados/mês" },
            { k: "waitMinutes", l: "Espera média (min)" },
            { k: "recordsPerDay", l: "Registros por dia" },
          ].map((f) => (
            <div key={f.k}>
              <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                {f.l}
              </Label>
              <Input
                type="number"
                min={0}
                disabled={!interactive}
                value={String(input[f.k as keyof typeof input] ?? 0)}
                onChange={set(f.k as keyof typeof input)}
                className="mt-1.5"
              />
            </div>
          ))}
        </div>
        <div className="glass-card rounded-2xl p-7">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Tempo potencialmente acumulado
          </p>
          <p className="mt-2 text-4xl font-semibold text-brand">
            {numberBR(result.hoursPerMonth, 1)} h
            <span className="text-base font-normal text-muted-foreground">/mês</span>
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p>{numberBR(result.minutesPerDay)} minutos por dia</p>
            <p>{numberBR(result.minutesPerMonth)} minutos por mês</p>
            <p>{numberBR(result.hoursPerYear, 0)} horas por ano</p>
            <p className="pt-2 text-institutional">
              Estimativa financeira ilustrativa: {currency(result.estimatedCost)} / mês
            </p>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Esta é uma simulação ilustrativa baseada nas informações inseridas e não representa uma
            garantia de economia.
          </p>
        </div>
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <BadgeCheck className="h-4 w-4 text-brand" strokeWidth={1.75} />
        Resultado calculado a partir dos dados informados pelo consultor.
      </p>
      <span className="hidden">
        <Wifi />
      </span>
    </Section>
  );
}
