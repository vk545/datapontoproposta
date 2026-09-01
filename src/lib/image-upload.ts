/**
 * Converte um arquivo de imagem em data URL comprimida, pronta para ser salva
 * no banco e exibida na proposta pública (inclusive por quem não tem login).
 */
export async function fileToDataUrl(file: File, maxSize = 900, quality = 0.85): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.");

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });

  if (file.type === "image/svg+xml") return dataUrl;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Imagem inválida."));
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);

  const hasAlpha = file.type === "image/png" || file.type === "image/webp";
  const out = canvas.toDataURL(hasAlpha ? "image/webp" : "image/jpeg", quality);
  return out.length < dataUrl.length ? out : dataUrl;
}
