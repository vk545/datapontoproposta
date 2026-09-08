import { Check, Sparkles } from "lucide-react";
import techBg from "@/assets/tech-bg.jpg";
import { Reveal, Stagger, StaggerItem } from "@/components/proposal/motion";
import { currency } from "@/lib/dataponto";
import type { ProposalItem, ProposalScenario } from "@/lib/solutions";

/**
 * Módulo de uma categoria de solução (Controle de Acesso, Controle Veicular,
 * Monitoramento…). Puxa imagem, descrição, características e benefícios da
 * cópia histórica salva na proposta.
 */
export function AreaModule({
  code,
  name,
  items,
  why,
}: {
  code: string;
  name: string;
  items: ProposalItem[];
  why: string;
}) {
  return (
    <section
      data-area={code}
      className="surface-institutional relative w-full overflow-hidden text-institutional-foreground"
    >
      <div aria-hidden className="dp-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div aria-hidden className="dp-aurora pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_var(--color-brand)]" />
            {name}
          </p>
          <h2 className="max-w-3xl text-3xl font-semibold sm:text-4xl">
            {items.length === 1 ? items[0].name : `${name} para a sua operação.`}
          </h2>
          {why ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-institutional-foreground/80">
              {why}
            </p>
          ) : null}
        </Reveal>

        <div className="mt-12 space-y-16">
          {items.map((it, idx) => (
            <Reveal key={it.id ?? `${it.name}-${idx}`}>
              <div
                className={`grid items-center gap-10 md:grid-cols-2 ${
                  idx % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative">
                  <div className="absolute inset-6 -z-10 rounded-full bg-brand/20 blur-3xl" />
                  <span className="dp-glass-dark dp-float absolute -left-2 top-4 z-10 rounded-2xl px-4 py-2.5 shadow-lg">
                    <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-brand">
                      Quantidade
                    </span>
                    <span className="text-xs font-medium">
                      {it.quantity} {it.quantity === 1 ? "unidade" : "unidades"}
                    </span>
                  </span>
                  <img
                    src={it.image_url || techBg}
                    alt={it.name}
                    loading="lazy"
                    className={`dp-float mx-auto w-full max-w-md drop-shadow-2xl ${
                      it.image_url ? "" : "rounded-3xl opacity-70"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold sm:text-3xl">{it.name}</h3>
                  {it.description ? (
                    <p className="mt-4 leading-relaxed text-institutional-foreground/80">
                      {it.description}
                    </p>
                  ) : null}
                  {it.features.length > 0 ? (
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
                        Características
                      </p>
                      <Stagger className="mt-3 space-y-2">
                        {it.features.map((f) => (
                          <StaggerItem key={f}>
                            <p className="flex items-start gap-2 text-sm">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
                              {f}
                            </p>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>
                  ) : null}
                  {it.benefits.length > 0 ? (
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
                        Benefícios
                      </p>
                      <Stagger className="mt-3 grid gap-2 sm:grid-cols-2">
                        {it.benefits.map((b) => (
                          <StaggerItem key={b}>
                            <div className="dp-glass-dark rounded-xl px-4 py-3 text-sm">{b}</div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ScenariosBlock({ scenarios }: { scenarios: ProposalScenario[] }) {
  return (
    <section className="dp-grid-bg relative w-full overflow-hidden bg-card">
      <div className="relative mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand">Cenários</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-4xl">
            Três formas de colocar a solução em operação.
          </h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
          {scenarios.map((sc) => (
            <StaggerItem key={sc.id ?? sc.key}>
              <div
                className={`h-full rounded-2xl border p-6 ${
                  sc.recommended ? "border-brand dp-glow-green bg-brand-soft/40" : "border-border/60 dp-glass"
                }`}
              >
                <p className="flex items-center gap-1.5 text-sm font-semibold text-institutional">
                  {sc.recommended && <Sparkles className="h-3.5 w-3.5 text-brand" />}
                  {sc.title}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{sc.description}</p>
                <p className="mt-4 text-2xl font-semibold">
                  {currency(Number(sc.monthly_total))}
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                {Number(sc.upfront_total) > 0 && (
                  <p className="text-xs text-muted-foreground">
                    + {currency(Number(sc.upfront_total))} inicial
                  </p>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
