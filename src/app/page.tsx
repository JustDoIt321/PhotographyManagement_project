import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Workbench from "@/components/workbench";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName =
    (user.user_metadata?.name as string | undefined) || user.email || "摄影师";

  return (
    <Workbench
      userId={user.id}
      email={user.email ?? ""}
      displayName={displayName}
    />
  );
}
