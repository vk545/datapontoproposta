import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { KeyRound, Shield, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
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
import {
  createConsultant,
  getMyRole,
  listTeam,
  removeConsultant,
  setConsultantPassword,
  setConsultantRole,
} from "@/lib/team.functions";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Consultores — Dataponto Propostas" },
      {
        name: "description",
        content:
          "Crie e gerencie os logins da equipe comercial. Cada consultor acessa apenas as próprias propostas.",
      },
      { property: "og:title", content: "Consultores — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Gestão de acessos da equipe comercial Dataponto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <TeamPage />
    </AppShell>
  ),
});

const EMPTY = { email: "", password: "", name: "", role_title: "", phone: "" };

function TeamPage() {
  const qc = useQueryClient();
  const fnRole = useServerFn(getMyRole);
  const fnList = useServerFn(listTeam);
  const fnCreate = useServerFn(createConsultant);
  const fnPassword = useServerFn(setConsultantPassword);
  const fnRoleSet = useServerFn(setConsultantRole);
  const fnRemove = useServerFn(removeConsultant);

  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);
  const [pwdFor, setPwdFor] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState("");

  const roleQuery = useQuery({ queryKey: ["my-role"], queryFn: () => fnRole({}) });
  const isAdmin = roleQuery.data?.role === "admin";

  const team = useQuery({
    queryKey: ["team"],
    queryFn: () => fnList({}),
    enabled: isAdmin,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["team"] });

  const create = useMutation({
    mutationFn: () => fnCreate({ data: { ...form, role: "seller" as const } }),
    onSuccess: () => {
      toast.success("Consultor criado. Envie o e-mail e a senha para ele acessar.");
      setForm(EMPTY);
      setOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const changePwd = useMutation({
    mutationFn: (userId: string) => fnPassword({ data: { userId, password: newPwd } }),
    onSuccess: () => {
      toast.success("Senha atualizada.");
      setPwdFor(null);
      setNewPwd("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleRole = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "seller" }) => fnRoleSet({ data: v }),
    onSuccess: () => {
      toast.success("Permissão atualizada.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (userId: string) => fnRemove({ data: { userId } }),
    onSuccess: () => {
      toast.success("Acesso removido.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (roleQuery.isLoading) {
    return <p className="p-8 text-sm text-muted-foreground">Carregando…</p>;
  }

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Consultores" />
        <div className="p-8">
          <div className="rounded-xl border border-border bg-card p-7 text-sm text-muted-foreground shadow-soft">
            Apenas administradores podem gerenciar os acessos da equipe.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Consultores"
        description="Cada consultor acessa somente as próprias propostas. Administradores enxergam tudo."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-1.5 h-4 w-4" strokeWidth={1.75} />
                Novo consultor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo consultor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {(
                  [
                    ["name", "Nome", "text"],
                    ["email", "E-mail de acesso", "email"],
                    ["password", "Senha provisória", "text"],
                    ["role_title", "Cargo", "text"],
                    ["phone", "WhatsApp", "text"],
                  ] as const
                ).map(([k, l, t]) => (
                  <div key={k}>
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">
                      {l}
                    </Label>
                    <Input
                      type={t}
                      className="mt-1.5"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={create.isPending}>
                  {create.isPending ? "Criando…" : "Criar acesso"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Consultor</th>
                <th className="px-5 py-3 text-left font-medium">Perfil</th>
                <th className="px-5 py-3 text-left font-medium">Propostas</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {(team.data ?? []).map((m) => (
                <tr key={m.id} className="border-t border-border">
                  <td className="px-5 py-4">
                    <p className="font-medium">{m.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        m.role === "admin"
                          ? "bg-institutional/10 text-institutional"
                          : "bg-brand-soft text-brand"
                      }`}
                    >
                      {m.role === "admin" ? "Administrador" : "Consultor"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{m.proposals}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPwdFor(m.id)}
                        title="Definir nova senha"
                      >
                        <KeyRound className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Alternar administrador"
                        onClick={() =>
                          toggleRole.mutate({
                            userId: m.id,
                            role: m.role === "admin" ? "seller" : "admin",
                          })
                        }
                      >
                        <Shield className="h-4 w-4" strokeWidth={1.75} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Remover acesso"
                        onClick={() => {
                          if (confirm(`Remover o acesso de ${m.email}?`)) remove.mutate(m.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.75} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {team.data && team.data.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={4}>
                    Nenhum consultor cadastrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!pwdFor} onOpenChange={(v) => !v && setPwdFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir nova senha</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Nova senha
            </Label>
            <Input className="mt-1.5" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={() => pwdFor && changePwd.mutate(pwdFor)}>Salvar senha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
