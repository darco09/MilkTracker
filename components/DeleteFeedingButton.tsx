"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteFeeding } from "@/lib/actions";

export default function DeleteFeedingButton({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Hapus catatan feeding ini?")) return;
        startTransition(async () => {
          const res = await deleteFeeding(id);
          if (res.ok) router.refresh();
          else alert(res.error ?? "Gagal menghapus.");
        });
      }}
      className={className}
    >
      {isPending ? "..." : "Hapus"}
    </button>
  );
}
