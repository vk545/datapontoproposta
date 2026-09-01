import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Download, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProposalDocument } from "@/components/proposal/ProposalDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { dateBR } from "@/lib/dataponto";
import { isExpired, type Proposal } from "@/lib/proposal";

export const Route = createFileRoute("/p/$token")({
  head: () => ({
    meta: [
      { title: "Proposta Dataponto" },
      {
        name: "description",
        content:
          "Proposta personalizada de controle de ponto preparada pela Dataponto para a sua operação.",
      },
      { property: "og:title", content: "Proposta Dataponto" },
      {
        property: "og:description",
        content: "Proposta personalizada de controle de ponto preparada pela Dataponto.",
      },
    ],
  }),
  component: PublicProposal,
});

function PublicProposal() {
  const { token } = Route.useParams();
  const [approved, setApproved] = useState(false);
  const [form, setForm] = useState({ name: "", role_title: "", email: "" });
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["public-proposal", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*")
        .eq("public_token", token)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Proposal) ?? null;
    },
  });

  useEffect(() => {
    if (!data) return;
    setApproved(!!data.approved_at);
    const now = new Date().toISOString();
    supabase.from("proposal_views").insert({ proposal_id: data.id } as never).then(() => {});
    supabase
      .from("proposals")
      .update({
        last_viewed_at: now,
        first_viewed_at: data.first_viewed_at ?? now,
        status: data.status === "enviada" ? "visualizada" : data.status,
      } as never)
      .eq("id", data.id)
      .then(() => {});
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando proposta…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Proposta não encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifique o link recebido ou entre em contato com o seu consultor.
          </p>
        </div>
      </div>
    );
  }

  const expired = isExpired(data) || data.status === "expirada";

  async function approve() {
    if (!form.name.trim() || !data) return toast.error("Informe seu nome.");
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("proposal_approvals")
      .insert({ proposal_id: data.id, ...form } as never);
    if (error) return toast.error("Não foi possível registrar a aprovação.");
    await supabase
      .from("proposals")
      .update({ status: "aprovada", approved_at: now } as never)
      .eq("id", data.id);
    setApproved(true);
    setOpen(false);
    toast.success("Proposta aprovada com sucesso.");
  }

  const waLink = data.seller_phone
    ? `https://wa.me/55${(data.seller_phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá! Estou vendo a proposta da ${data.company_name} e tenho algumas dúvidas.`,
      )}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.print()}>
              <Download className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
              PDF
            </Button>
            {waLink ? (
              <Button variant="outline" size="sm" asChild>
                <a href={waLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
                  Tenho dúvidas
                </a>
              </Button>
            ) : null}
            {!expired && !approved ? (
              <Button size="sm" onClick={() => setOpen(true)}>
                Aprovar proposta
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input
                className="mt-1.5"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input
                className="mt-1.5"
                value={form.role_title}
                onChange={(e) => setForm({ ...form, role_title: e.target.value })}
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                className="mt-1.5"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={approve}>Confirmar aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {expired ? (
        <div className="mx-auto max-w-5xl px-6 pt-6">
          <div className="rounded-xl border border-border bg-surface p-5 text-sm">
            Esta proposta expirou em {dateBR(data.valid_until)}. Entre em contato com o consultor
            para receber uma nova condição comercial.
          </div>
        </div>
      ) : null}

      <ProposalDocument proposal={data} publicView />

      <section className="no-print border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-14 text-center">
          {approved ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand-soft px-5 py-2.5 text-sm font-medium text-institutional">
              <Check className="h-4 w-4 text-brand" strokeWidth={2.5} />
              Proposta aprovada com sucesso.
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => setOpen(true)} disabled={expired}>
                Aprovar proposta
              </Button>
              {waLink ? (
                <Button size="lg" variant="outline" asChild>
                  <a href={waLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
                    Tenho dúvidas
                  </a>
                </Button>
              ) : null}
            </div>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Dataponto · Proposta preparada para {data.company_name}
            {data.valid_until ? ` · válida até ${dateBR(data.valid_until)}` : ""}
          </p>
        </div>
      </section>
    </div>
  );
}

