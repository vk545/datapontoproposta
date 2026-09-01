import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileToDataUrl } from "@/lib/image-upload";

export function ImageField({
  label,
  value,
  onChange,
  maxSize = 900,
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
  maxSize?: number;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface">
          {value ? (
            <img src={value} alt={label} loading="lazy" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => input.current?.click()}
            >
              {busy ? "Processando…" : "Enviar imagem"}
            </Button>
            {value ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            ) : null}
          </div>
          <Input
            value={value ?? ""}
            placeholder="ou cole uma URL https://…"
            onChange={(e) => onChange(e.target.value || null)}
          />
          {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            onChange(await fileToDataUrl(file, maxSize));
            toast.success("Imagem carregada. Não esqueça de salvar.");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Falha ao carregar a imagem.");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
