import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CompanyBrand = {
  company_name: string;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  site: string | null;
  address: string | null;
  footer: string | null;
};

export function useCompanyBrand() {
  const { data } = useQuery({
    queryKey: ["company-brand"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("company_name,logo_url,phone,whatsapp,email,site,address,footer")
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as CompanyBrand) ?? null;
    },
  });
  return data ?? null;
}

export function useProductImages() {
  const { data } = useQuery({
    queryKey: ["product-images"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("code,name,main_image_url");
      if (error) throw error;
      return (data ?? []) as { code: string; name: string; main_image_url: string | null }[];
    },
  });
  return (code: string) => data?.find((p) => p.code === code)?.main_image_url ?? null;
}

export function BrandLogo({ className = "" }: { className?: string }) {
  const brand = useCompanyBrand();
  if (brand?.logo_url) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.company_name || "Logo da empresa"}
        loading="lazy"
        className={`h-9 w-auto object-contain ${className}`}
      />
    );
  }
  return (
    <span className={`text-sm font-semibold tracking-tight ${className}`}>
      data<span className="text-brand">ponto</span>
    </span>
  );
}

/** Imagem do produto cadastrada no painel, com fallback para a arte padrão. */
export function ProductImage({
  code,
  fallback,
  alt,
  className = "",
  eager = false,
}: {
  code: string;
  fallback: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const imageOf = useProductImages();
  const src = imageOf(code) || fallback;
  return (
    <img
      src={src}
      alt={alt}
      {...(eager ? {} : { loading: "lazy" as const })}
      className={className}
    />
  );
}
