import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ImageField } from "@/components/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/dataponto";
import { useCatalog, type Area, type CatalogProduct, type Subcategory } from "@/lib/solutions";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Dataponto Propostas" },
      {
        name: "description",
        content:
          "Catálogo de soluções Dataponto por categoria: controle de ponto, acesso, veicular e monitoramento.",
      },
      { property: "og:title", content: "Produtos — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Catálogo de soluções Dataponto organizado por categoria, com preços editáveis.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Products />
    </AppShell>
  ),
});

type Editable = Pick<
  CatalogProduct,
  | "name"
  | "description"
  | "default_price"
  | "billing"
  | "kind"
  | "features"
  | "benefits"
  | "main_image_url"
  | "gallery"
  | "active"
  | "area_id"
  | "subcategory_id"
  | "highlight"
>;

const KIND_LABEL: Record<string, string> = {
  equipment: "Equipamento",
  system: "Sistema",
  service: "Serviço",
};

function Products() {
  const qc = useQueryClient();
  const { data: catalog } = useCatalog({ activeOnly: false });
  const [filter, setFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);

  const areas = catalog?.areas ?? [];
  const subs = catalog?.subcategories ?? [];
  const products = catalog?.products ?? [];
  const activeAreas = areas.filter((a) => a.active);

  const visible = useMemo(
    () =>
      products.filter((p) =>
        filter === "all" ? true : filter === "none" ? !p.area_id : p.area_id === filter,
      ),
    [products, filter],
  );

  const refresh = () => qc.invalidateQueries({ queryKey: ["catalog"] });

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Catálogo de soluções por categoria. Imagens, descrições e preços padrão usados nas propostas."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
            Novo produto
          </Button>
        }
      />
      <div className="p-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {[{ id: "all", name: "Todos" }, ...activeAreas.map((a) => ({ id: a.id, name: a.name }))].map(
            (f) => {
              const count =
                f.id === "all" ? products.length : products.filter((p) => p.area_id === f.id).length;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    filter === f.id
                      ? "border-institutional bg-institutional text-institutional-foreground"
                      : "border-border text-muted-foreground hover:bg-surface"
                  }`}
                >
                  {f.name} <span className="opacity-60">({count})</span>
                </button>
              );
            },
          )}
        </div>

        {creating ? (
          <div className="mb-6">
            <ProductForm
              areas={activeAreas}
              subs={subs}
              onCancel={() => setCreating(false)}
              onSaved={() => {
                setCreating(false);
                refresh();
              }}
            />
          </div>
        ) : null}

        {visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Nenhum produto nesta categoria ainda. Clique em <strong>Novo produto</strong> para
            cadastrar catracas, cancelas, câmeras ou qualquer outra solução.
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {visible.map((p) => (
              <ProductForm
                key={p.id}
                product={p}
                areas={activeAreas}
                subs={subs}
                onSaved={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ProductForm({
  product,
  areas,
  subs,
  onSaved,
  onCancel,
}: {
  product?: CatalogProduct;
  areas: Area[];
  subs: Subcategory[];
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const isNew = !product;
  const [v, setV] = useState<Editable>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    default_price: product?.default_price ?? 0,
    billing: product?.billing ?? "onetime",
    kind: product?.kind ?? "equipment",
    features: product?.features ?? [],
    benefits: product?.benefits ?? [],
    main_image_url: product?.main_image_url ?? null,
    gallery: product?.gallery ?? [],
    active: product?.active ?? true,
    area_id: product?.area_id ?? areas[0]?.id ?? null,
    subcategory_id: product?.subcategory_id ?? null,
    highlight: product?.highlight ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<Editable>) => setV({ ...v, ...patch });

  const areaSubs = subs.filter((s) => s.area_id === v.area_id && s.active);
  const areaName = areas.find((a) => a.id === v.area_id)?.name;

  async function save() {
    if (!v.name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    if (!v.area_id) {
      toast.error("Escolha a categoria da solução.");
      return;
    }
    setSaving(true);
    const payload = {
      ...v,
      subcategory_id: areaSubs.some((s) => s.id === v.subcategory_id) ? v.subcategory_id : null,
    };
    let error: { message: string } | null = null;
    if (isNew) {
      const code = `${v.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")}_${Date.now().toString(36)}`;
      ({ error } = await supabase
        .from("products")
        .insert({ ...payload, code, sort_order: 100 } as never));
    } else {
      ({ error } = await supabase.from("products").update(payload as never).eq("id", product.id));
    }
    setSaving(false);
    if (error) {
      toast.error("Somente administradores podem alterar produtos.");
      return;
    }
    toast.success(isNew ? "Produto cadastrado." : "Produto atualizado.");
    onSaved();
  }

  async function remove() {
    if (!product) return;
    if (!confirm(`Excluir "${product.name}"? Propostas já criadas mantêm a cópia do produto.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      toast.error("Não foi possível excluir. Desative o produto em vez disso.");
      return;
    }
    toast.success("Produto excluído.");
    onSaved();
  }

  return (
    <div
      className={`rounded-xl border bg-card p-7 shadow-soft ${
        isNew ? "border-brand/50" : "border-border"
      } ${!v.active ? "opacity-80" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {isNew ? "Novo produto" : `${areaName ?? "Sem categoria"} · ${KIND_LABEL[v.kind] ?? v.kind}`}
          </p>
          <h2 className="mt-1 text-lg font-semibold">{v.name || "Sem nome"}</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-lg font-semibold text-brand">
            {currency(Number(v.default_price))}
            {v.billing === "monthly" ? (
              <span className="text-xs font-normal text-muted-foreground">/mês</span>
            ) : null}
          </p>
          {onCancel ? (
            <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancelar">
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <F label="Nome" full>
          <Input value={v.name} onChange={(e) => set({ name: e.target.value })} />
        </F>
        <F label="Categoria da solução">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={v.area_id ?? ""}
            onChange={(e) => set({ area_id: e.target.value || null, subcategory_id: null })}
          >
            <option value="">Selecione…</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </F>
        <F label="Subcategoria">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={v.subcategory_id ?? ""}
            onChange={(e) => set({ subcategory_id: e.target.value || null })}
          >
            <option value="">—</option>
            {areaSubs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </F>
        <F label="Tipo">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={v.kind}
            onChange={(e) => set({ kind: e.target.value })}
          >
            <option value="equipment">Equipamento</option>
            <option value="system">Sistema</option>
            <option value="service">Serviço</option>
          </select>
        </F>
        <F label="Cobrança">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={v.billing}
            onChange={(e) => set({ billing: e.target.value })}
          >
            <option value="onetime">Investimento único</option>
            <option value="monthly">Mensal</option>
          </select>
        </F>
        <F label="Preço padrão">
          <Input
            type="number"
            value={String(v.default_price)}
            onChange={(e) => set({ default_price: Number(e.target.value) })}
          />
        </F>
        <F label="Status">
          <label className="flex h-9 items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--brand)]"
              checked={v.active}
              onChange={(e) => set({ active: e.target.checked })}
            />
            {v.active ? "Ativo (aparece nas propostas)" : "Inativo"}
          </label>
        </F>
        <F label="Descrição" full>
          <Textarea
            rows={3}
            value={v.description}
            onChange={(e) => set({ description: e.target.value })}
          />
        </F>
        <F label="Destaque curto" full>
          <Input
            value={v.highlight}
            placeholder="Ex.: Reconhecimento facial em menos de 1 segundo"
            onChange={(e) => set({ highlight: e.target.value })}
          />
        </F>
        <ListField
          label="Características"
          hint="Uma por linha."
          value={v.features}
          onChange={(features) => set({ features })}
        />
        <ListField
          label="Benefícios"
          hint="Uma por linha."
          value={v.benefits}
          onChange={(benefits) => set({ benefits })}
        />
      </div>

      <div className="mt-6 space-y-5">
        <ImageField
          label="Imagem principal"
          value={v.main_image_url}
          hint="Aparece na proposta enviada ao cliente."
          onChange={(next) => set({ main_image_url: next })}
        />
        <div>
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">
            Galeria (imagens adicionais)
          </Label>
          <div className="mt-2 space-y-3">
            {v.gallery.map((g, i) => (
              <div key={`${i}-${g.slice(0, 16)}`} className="flex items-start gap-2">
                <div className="flex-1">
                  <ImageField
                    label={`Imagem ${i + 1}`}
                    value={g}
                    onChange={(next) => {
                      const gallery = [...v.gallery];
                      if (next) gallery[i] = next;
                      else gallery.splice(i, 1);
                      set({ gallery });
                    }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => set({ main_image_url: g })}
                  title="Definir como principal"
                >
                  Principal
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => set({ gallery: [...v.gallery, ""] })}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Adicionar imagem
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Salvando…" : isNew ? "Cadastrar produto" : "Salvar alterações"}
        </Button>
        {!isNew ? (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={remove}>
            <Trash2 className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
            Excluir
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ListField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <F label={label}>
      <Textarea
        rows={4}
        value={text}
        placeholder={hint}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          );
        }}
      />
    </F>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
