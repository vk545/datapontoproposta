import { STATUS_LABEL, type Status } from "@/lib/dataponto";

const TONE: Record<string, string> = {
  rascunho: "border-border bg-muted text-muted-foreground",
  enviada: "border-institutional/25 bg-institutional-soft text-institutional",
  visualizada: "border-institutional/40 bg-institutional-soft text-institutional",
  aprovada: "border-brand/40 bg-brand-soft text-institutional",
  recusada: "border-destructive/30 bg-destructive/10 text-destructive",
  expirada: "border-border bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-medium ${
        TONE[status] ?? TONE['rascunho']
      }`}
    >
      {STATUS_LABEL[status as Status] ?? status}
    </span>
  );
}
