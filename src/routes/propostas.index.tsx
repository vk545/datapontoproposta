import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Copy, Eye, Pencil, Plus, Presentation, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currency, dateBR, STATUSES, STATUS_LABEL } from "@/lib/dataponto";
import type { Proposal } from "@/lib/proposal";

export const Route = createFileRoute("/propostas/")({
  head: () => ({
    meta: [
      { title: "Propostas — Dataponto Propostas" },
      {
        name: "description",
        content: "Lista de propostas comerciais da Dataponto com status, valores e validade.",
      },
      { property: "og:title", content: "Propostas — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Lista de propostas comerciais da Dataponto com status, valores e validade.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ProposalsList />
    </AppShell>
  ),
});

function ProposalsList() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("todos");

  const { data: proposals = [] } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Proposal[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return proposals.filter((p) => {
      const okStatus = status === "todos" || p.status === status;
      const okSearch =
        !q ||
        [p.company_name, p.contact_name, p.cnpj, p.phone, p.seller_name, String(p.number)]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return okStatus && okSearch;
    });
  }, [proposals, search, status]);

  async function duplicate(p: Proposal) {
    const { id, created_at, updated_at, public_token, number, ...rest } = p;
    void id;
    void created_at;
    void updated_at;
    void public_token;
    void number;
    const { data, error } = await supabase
      .from("proposals")
      .insert({
        ...rest,
        company_name: `${p.company_name} (cópia)`,
        status: "rascunho",
        sent_at: null,
        first_viewed_at: null,
        last_viewed_at: null,
        approved_at: null,
      } as never)
      .select("id")
      .single();
    if (error) return toast.error("Não foi possível duplicar.");
    qc.invalidateQueries({ queryKey: ["proposals"] });
    navigate({ to: "/propostas/$id/editar", params: { id: (data as { id: string }).id } });
  }

  async function remove(p: Proposal) {
    const { error } = await supabase.from("proposals").delete().eq("id", p.id);
    if (error) return toast.error("Não foi possível excluir.");
    toast.success("Proposta excluída.");
    qc.invalidateQueries({ queryKey: ["proposals"] });
  }

  function share(p: Proposal) {
    const url = `${window.location.origin}/p/${p.public_token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link da proposta copiado.");
  }

  return (
    <>
      <PageHeader
        title="Propostas"
        description="Crie, acompanhe e compartilhe propostas comerciais."
        actions={
          <Button asChild>
            <Link to="/propostas/nova">
              <Plus className="mr-1.5 h-4 w-4" strokeWidth={2} />
              Nova proposta
            </Link>
          </Button>
        }
      />
      <div className="p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Buscar por empresa, responsável, CNPJ, telefone ou vendedor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <div className="flex flex-wrap gap-1.5">
            {["todos", ...STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  status === s
                    ? "border-institutional bg-institutional text-institutional-foreground"
                    : "border-border text-muted-foreground hover:bg-surface"
                }`}
              >
                {s === "todos" ? "Todos" : STATUS_LABEL[s as never]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-3.5 font-medium">Cliente</th>
                <th className="px-4 py-3.5 font-medium">Vendedor</th>
                <th className="px-4 py-3.5 font-medium">Data</th>
                <th className="px-4 py-3.5 font-medium">Solução</th>
                <th className="px-4 py-3.5 font-medium">Valor</th>
                <th className="px-4 py-3.5 font-medium">Status</th>
                <th className="px-4 py-3.5 font-medium">Validade</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface">
                  <td className="px-6 py-4 font-medium">{p.company_name || "—"}</td>
                  <td className="px-4 py-4 text-muted-foreground">{p.seller_name || "—"}</td>
                  <td className="px-4 py-4 text-muted-foreground">{dateBR(p.created_at)}</td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {p.modality === "primme" ? "Primme" : "Compra"} ·{" "}
                    {p.system_plan === "nenhum"
                      ? "sem sistema"
                      : p.system_plan === "pro"
                        ? "Pro"
                        : "Ultimate"}
                  </td>
                  <td className="px-4 py-4">
                    {currency(Number(p.monthly_total))}/mês
                    {Number(p.upfront_total) > 0 ? (
                      <span className="block text-xs text-muted-foreground">
                        + {currency(Number(p.upfront_total))}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{dateBR(p.valid_until)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title="Editar">
                        <Link to="/propostas/$id/editar" params={{ id: p.id }}>
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title="Apresentar">
                        <Link to="/propostas/$id/apresentar" params={{ id: p.id }}>
                          <Presentation className="h-4 w-4" strokeWidth={1.75} />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title="Visualizar">
                        <a href={`/p/${p.public_token}`} target="_blank" rel="noreferrer">
                          <Eye className="h-4 w-4" strokeWidth={1.75} />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Compartilhar"
                        onClick={() => share(p)}
                      >
                        <Share2 className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Duplicar"
                        onClick={() => duplicate(p)}
                      >
                        <Copy className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Excluir" onClick={() => remove(p)}>
                        <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhuma proposta encontrada.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
