"use client";

import { AppProvider } from "@/lib/store";
import AppShell from "@/components/app-shell";

export default function Workbench({
  userId,
  email,
  displayName,
}: {
  userId: string;
  email: string;
  displayName: string;
}) {
  return (
    <AppProvider userId={userId} email={email} displayName={displayName}>
      <AppShell />
    </AppProvider>
  );
}
