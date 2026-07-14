"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-actions";

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await signOut();
          router.replace("/login");
          router.refresh();
        });
      }}
      className="text-sm font-semibold text-gray-400 disabled:opacity-60"
    >
      {isPending ? "..." : "Keluar"}
    </button>
  );
}
