"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/60 transition-colors hover:text-[var(--color-vermillion)] disabled:opacity-50"
    >
      {isPending ? "..." : "Log out"}
    </button>
  );
}
