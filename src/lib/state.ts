import { createClient } from "@/lib/supabase/server";

export interface AppState {
  projects: unknown[];
  expenses: unknown[];
  settings: Record<string, unknown>;
  clients: unknown[];
}

/** 从 Supabase 的 app_state 表读取当前用户的数据快照 */
export async function loadCloudState(userId: string): Promise<AppState | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_state")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.data) return null;

  const d = data.data as Partial<AppState>;
  return {
    projects: Array.isArray(d.projects) ? d.projects : [],
    expenses: Array.isArray(d.expenses) ? d.expenses : [],
    settings: d.settings ?? {},
    clients: Array.isArray(d.clients) ? d.clients : [],
  };
}

/** 把当前用户的数据快照 upsert 到 app_state 表 */
export async function saveCloudState(userId: string, state: AppState) {
  const supabase = await createClient();
  await supabase.from("app_state").upsert({
    user_id: userId,
    data: state,
    updated_at: new Date().toISOString(),
  });
}
