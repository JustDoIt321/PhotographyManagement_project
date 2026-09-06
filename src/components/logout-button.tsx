"use client";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.replace("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-red-400 hover:text-red-600"
    >
      退出登录
    </button>
  );
}
