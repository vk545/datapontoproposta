import { Check, PackageOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/dataponto";
import {
  PONTO,
  snapshotOf,
  type Area,
  type CatalogProduct,
  type ProposalItem,
} from "@/lib/solutions";

/** Cartões grandes para escolher as categorias de solução da proposta. */
export function AreaCards({
  areas,
  value,
  onChange,
}: {
  areas: Area[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (code: string) =>
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {areas.map((a) => {
        const on = value.includes(a.code);
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => toggle(a.code)}
            className={`relative rounded-xl border p-5 text-left transition-all ${
              on
                ? "border-brand bg-brand-soft shadow-[0_0_0_1px_var(--color-brand)]"
                : "border-border bg-card hover:border-brand/40 hover:bg-surface"
            }`}
          >
            <span
              className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border ${
                on ? "border-brand bg-brand text-brand-foreground" : "border-border"
              }`}
            >
              {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-institutional">
              {a.name}
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">{a.description}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Seleção de produtos por categoria escolhida.
 * A categoria "ponto" usa o módulo clássico — renderizado via `pontoSlot`.
 */
export function ProductPicker({
  areas,
  products,
  areaCodes,
  items,
  onItems,
  why,
  onWhy,
  pontoSlot,
}: {
  areas: Area[];
  products: CatalogProduct[];
  areaCodes: string[];
  items: ProposalItem[];
  onItems: (next: ProposalItem[]) => void;
  why: Record<string, string>;
  onWhy: (next: Record<string, string>) => void;
  pontoSlot?: React.ReactNode;
}) {
  const ordered = areas.filter((a) => areaCodes.includes(a.code));
  const byId = (id: string | null) => items.find((i) => i.product_id === id);

  const toggle = (p: CatalogProduct, code: string) => {
    if (byId(p.id)) onItems(items.filter((i) => i.product_id !== p.id));
    else onItems([...items, snapshotOf(p, code, items.length)]);
  };
  const patch = (id: string, patch: Partial<ProposalItem>) =>
    onItems(items.map((i) => (i.product_id === id ? { ...i, ...patch } : i)));

  if (!ordered.length) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Escolha ao menos uma solução para ver os produtos disponíveis.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {ordered.map((area) => {
        if (area.code === PONTO && pontoSlot) {
          return (
            <div key={area.id} className="rounded-xl border border-brand/40 bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-institutional">
                {area.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{area.description}</p>
              <div className="mt-6">{pontoSlot}</div>
            </div>
          );
        }
        const list = products.filter((p) => p.area_id === area.id);
        const selectedHere = items.filter((i) => i.area_code === area.code);
        return (
          <div
            key={area.id}
            className={`rounded-xl border p-6 transition-colors ${
              selectedHere.length ? "border-brand/50 bg-brand-soft/30" : "border-border bg-card"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-institutional">
              {area.name}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{area.description}</p>

            {list.length === 0 ? (
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                <PackageOpen className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} />
                <span>
                  Nenhum produto ativo cadastrado nesta categoria ainda.{" "}
                  <Link to="/produtos" className="text-brand underline-offset-2 hover:underline">
                    Cadastre em Produtos
                  </Link>{" "}
                  e ele aparecerá aqui.
                </span>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {list.map((p) => {
                  const sel = byId(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`rounded-lg border p-4 text-sm transition-colors ${
                        sel ? "border-brand bg-card" : "border-border bg-background"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 accent-[var(--brand)]"
                          checked={!!sel}
                          onChange={() => toggle(p, area.code)}
                        />
                        {p.main_image_url ? (
                          <img
                            src={p.main_image_url}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-md border border-border object-contain"
                          />
                        ) : null}
                        <span className="min-w-0">
                          <span className="block font-medium">{p.name}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {p.billing === "monthly" ? "Mensal" : "Investimento único"} ·{" "}
                            {currency(Number(p.default_price))}
                          </span>
                        </span>
                      </label>
                      {sel ? (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Qtd.
                            </span>
                            <Input
                              type="number"
                              min={1}
                              className="mt-1 h-8"
                              value={String(sel.quantity)}
                              onChange={(e) =>
                                patch(p.id, { quantity: Math.max(1, Number(e.target.value) || 1) })
                              }
                            />
                          </div>
                          <div>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              Preço aplicado
                            </span>
                            <Input
                              type="number"
                              className="mt-1 h-8"
                              value={String(sel.unit_price)}
                              onChange={(e) => patch(p.id, { unit_price: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedHere.length > 0 ? (
              <div className="mt-5">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Por que esta solução? (aparece para o cliente)
                </span>
                <Textarea
                  rows={2}
                  className="mt-1.5"
                  placeholder={`Explique por que ${area.name.toLowerCase()} faz sentido para a operação do cliente.`}
                  value={why[area.code] ?? ""}
                  onChange={(e) => onWhy({ ...why, [area.code]: e.target.value })}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
