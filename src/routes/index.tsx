import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { currency, dateBR, STATUS_LABEL, type Status } from "@/lib/dataponto";
import type { Proposal } from "@/lib/proposal";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Dataponto Propostas" },
      {
        name: "description",
        content:
          "Acompanhe propostas em aberto, visualizações, aprovações e valor em negociação da Dataponto.",
      },
      { property: "og:title", content: "Dashboard — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Acompanhe propostas em aberto, visualizações e aprovações da Dataponto.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

function Dashboard() {
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

  const count = (s: Status) => proposals.filter((p) => p.status === s).length;
  const open = proposals.filter((p) => ["enviada", "visualizada"].includes(p.status));
  const approved = proposals.filter((p) => p.status === "aprovada");
  const value = (list: Proposal[]) =>
    list.reduce((acc, p) => acc + Number(p.monthly_total) * 12 + Number(p.upfront_total), 0);
  const conversion = proposals.length
    ? Math.round((approved.length / proposals.length) * 100)
    : 0;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const cards = [
    { label: "Propostas", value: String(proposals.length) },
    { label: "Em negociação", value: String(open.length) },
    { label: "Visualizadas", value: String(count("visualizada")) },
    { label: "Aprovadas", value: String(approved.length) },
    { label: "Valor em negociação", value: currency(value(open)) },
    { label: "Valor aprovado", value: currency(value(approved)) },
  ];

  return (
    <>
      <PageHeader
        title={`${greet}.`}
        description="Visão geral das propostas comerciais."
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</p>
              <p className="mt-3 text-2xl font-semibold text-institutional">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Taxa de conversão</p>
            <p className="text-sm font-semibold text-brand">{conversion}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${conversion}%` }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {approved.length} aprovadas de {proposals.length} propostas criadas.
          </p>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Propostas recentes
            </h2>
            <Link
              to="/propostas"
              className="flex items-center gap-1 text-sm text-brand hover:underline"
            >
              Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
            {proposals.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/propostas/$id/editar"
                params={{ id: p.id }}
                className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 transition-colors last:border-0 hover:bg-surface"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.company_name || "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">
                    {dateBR(p.created_at)} · {STATUS_LABEL[p.status as Status] ?? p.status}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {currency(Number(p.monthly_total))}/mês
                  </span>
                  <StatusBadge status={p.status} />
                </div>
              </Link>
            ))}
            {proposals.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                Nenhuma proposta criada ainda.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
