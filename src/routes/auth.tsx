import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acessar — Dataponto Propostas" },
      {
        name: "description",
        content: "Área restrita da equipe comercial Dataponto para gestão de propostas.",
      },
      { property: "og:title", content: "Acessar — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Área restrita da equipe comercial Dataponto para gestão de propostas.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada. Você já pode acessar.");
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível concluir.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="surface-institutional hidden flex-col justify-between p-12 md:flex">
        <div>
          <p className="text-lg font-semibold">
            data<span className="text-brand">ponto</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-institutional-foreground/60">
            Propostas
          </p>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight text-balance-tight">
            Transforme uma cotação em uma experiência de venda baseada em valor.
          </h1>
          <p className="mt-5 max-w-sm text-institutional-foreground/70">
            Problema, impacto, solução, implementação, proteção — e só então o investimento.
          </p>
        </div>
        <p className="text-xs text-institutional-foreground/50">Uso interno Dataponto</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold">
            {mode === "login" ? "Acessar a plataforma" : "Criar acesso"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Entre com sua conta corporativa."
              : "Cadastre seu acesso de consultor."}
          </p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" ? (
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5"
                  required
                />
              </div>
            ) : null}
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          <Button variant="outline" className="mt-3 w-full" onClick={google}>
            Continuar com o Google
          </Button>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Os acessos são criados pelo administrador da Dataponto em Consultores.
          </p>
        </div>
      </div>
    </div>
  );
}
