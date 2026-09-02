import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVisibleSections } from "@/components/proposal/ProposalDocument";
import { SECTION_LABELS } from "@/lib/dataponto";
import type { Proposal } from "@/lib/proposal";

export const Route = createFileRoute("/propostas/$id/apresentar")({
  head: () => ({
    meta: [
      { title: "Modo apresentação — Dataponto Propostas" },
      {
        name: "description",
        content: "Apresente a proposta em tela cheia, seção por seção, sem elementos internos.",
      },
      { property: "og:title", content: "Modo apresentação — Dataponto Propostas" },
      {
        property: "og:description",
        content: "Apresente a proposta em tela cheia, seção por seção.",
      },
    ],
  }),
  component: Present,
});

function Present() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const { data } = useQuery({
    queryKey: ["proposal", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals").select("*").eq("id", id).single();
      if (error) throw error;
      return data as unknown as Proposal;
    },
  });

  const empty: Proposal | null = data ?? null;
  const sections = useVisibleSections(
    empty ?? ({ sections: {}, need_key: "outro" } as unknown as Proposal),
  );
  const total = empty ? sections.length : 0;

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.min(Math.max(i + delta, 0), Math.max(total - 1, 0))),
    [total],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") navigate({ to: "/propostas/$id/editar", params: { id } });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, id, navigate]);

  if (!empty) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando apresentação…</p>
      </div>
    );
  }

  const current = sections[index];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 overflow-y-auto" style={{ perspective: "1600px" }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current?.key}
            initial={{ opacity: 0, rotateY: 14, scale: 0.94, x: 60, filter: "blur(14px)" }}
            animate={{ opacity: 1, rotateY: 0, scale: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, rotateY: -12, scale: 0.94, x: -60, filter: "blur(14px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {current?.node}
          </motion.div>
        </AnimatePresence>
      </div>


      <div className="sticky bottom-0 border-t border-border bg-card/95 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {current ? SECTION_LABELS[current.key] : ""} · {index + 1}/{total}
          </p>
          <div className="mx-4 h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${((index + 1) / Math.max(total, 1)) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => go(-1)}
              disabled={index === 0}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface disabled:opacity-40"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => go(1)}
              disabled={index >= total - 1}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface disabled:opacity-40"
              aria-label="Próximo"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => document.documentElement.requestFullscreen?.()}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface"
              aria-label="Tela cheia"
            >
              <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => navigate({ to: "/propostas/$id/editar", params: { id } })}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface"
              aria-label="Sair"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
