import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Não foi possível validar suas permissões.");
  const isAdmin = (data ?? []).some((r: { role: string }) => r.role === "admin");
  if (!isAdmin) throw new Error("Apenas administradores podem gerenciar consultores.");
}

export type TeamMember = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "seller";
  created_at: string;
  proposals: number;
};

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r: { role: string }) => r.role);
    return { role: roles.includes("admin") ? "admin" : "seller" } as const;
  });

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);

    const [{ data: profiles }, { data: roles }, { data: proposals }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id,name,email"),
      supabaseAdmin.from("user_roles").select("user_id,role"),
      supabaseAdmin.from("proposals").select("owner_id"),
    ]);

    const members: TeamMember[] = authUsers.users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      name:
        (profiles ?? []).find((p) => p.id === u.id)?.name ||
        (u.user_metadata?.["name"] as string) ||
        "",
      role:
        (roles ?? []).some((r) => r.user_id === u.id && r.role === "admin") ? "admin" : "seller",
      created_at: u.created_at,
      proposals: (proposals ?? []).filter((p) => p.owner_id === u.id).length,
    }));

    members.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return members;
  });

export const createConsultant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      email: string;
      password: string;
      name: string;
      role_title?: string;
      phone?: string;
      role: "admin" | "seller";
    }) => {
      if (!input.email?.includes("@")) throw new Error("Informe um e-mail válido.");
      if (!input.password || input.password.length < 8)
        throw new Error("A senha precisa ter ao menos 8 caracteres.");
      if (!input.name?.trim()) throw new Error("Informe o nome do consultor.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name.trim() },
    });
    if (error) throw new Error(error.message);
    const id = created.user.id;

    await supabaseAdmin.from("profiles").upsert({
      id,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role_title: data.role_title ?? "",
      phone: data.phone ?? "",
      whatsapp: data.phone ?? "",
    } as never);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", id);
    await supabaseAdmin.from("user_roles").insert({ user_id: id, role: data.role } as never);

    return { id };
  });

export const setConsultantPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; password: string }) => {
    if (!input.password || input.password.length < 8)
      throw new Error("A senha precisa ter ao menos 8 caracteres.");
    return input;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setConsultantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: "admin" | "seller" }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("user_roles").insert({
      user_id: data.userId,
      role: data.role,
    } as never);
    return { ok: true };
  });

export const removeConsultant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error("Você não pode remover a própria conta.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
