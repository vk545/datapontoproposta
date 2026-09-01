import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ImageField } from "@/components/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/dataponto";

type Product = {
  id: string;
  code: string;
  name: string;
  kind: string;
  billing: string;
  description: string;
  default_price: number;
  features: string[];
  main_image_url: string | null;
  active: boolean;
};

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Produtos — Dataponto Propostas" },
      {
        name: "description",
        content:
          "Biblioteca de produtos Dataponto: relógio facial, Comodato e sistemas Secullum, com preços editáveis.",
      },
      { property: "og:title", content: "Produtos — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Biblioteca de produtos Dataponto com preços e características editáveis.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Products />
    </AppShell>
  ),
});

function Products() {
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Partial<Product>>>({});

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  async function save(p: Product) {
    const patch = edits[p.id];
    if (!patch) return;
    const { error } = await supabase
      .from("products")
      .update(patch as never)
      .eq("id", p.id);
    if (error) {
      toast.error("Somente administradores podem alterar produtos.");
      return;
    }
    toast.success("Produto atualizado.");
    setEdits({ ...edits, [p.id]: {} });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Preços, descrições e características usados como padrão nas propostas."
      />
      <div className="grid gap-5 p-8 lg:grid-cols-2">
        {products.map((p) => {
          const v = { ...p, ...(edits[p.id] ?? {}) };
          return (
            <div key={p.id} className="rounded-xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {p.kind === "equipment"
                      ? "Equipamento"
                      : p.kind === "system"
                        ? "Sistema"
                        : "Serviço"}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{p.name}</h2>
                </div>
                <p className="text-lg font-semibold text-brand">
                  {currency(Number(v.default_price))}
                  {p.billing === "monthly" ? (
                    <span className="text-xs font-normal text-muted-foreground">/mês</span>
                  ) : null}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Preço padrão
                  </Label>
                  <Input
                    type="number"
                    className="mt-1.5"
                    value={String(v.default_price)}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        [p.id]: { ...edits[p.id], default_price: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Descrição
                  </Label>
                  <Textarea
                    rows={2}
                    className="mt-1.5"
                    value={v.description}
                    onChange={(e) =>
                      setEdits({
                        ...edits,
                        [p.id]: { ...edits[p.id], description: e.target.value },
                      })
                    }
                  />
                </div>
                <ImageField
                  label="Imagem do produto"
                  value={v.main_image_url ?? null}
                  hint="Aparece na proposta enviada ao cliente."
                  onChange={(next) =>
                    setEdits({
                      ...edits,
                      [p.id]: { ...edits[p.id], main_image_url: next },
                    })
                  }
                />

              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {(p.features ?? []).map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <Button className="mt-6" size="sm" onClick={() => save(p)}>
                Salvar alterações
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
