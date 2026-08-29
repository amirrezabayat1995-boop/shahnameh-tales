"use client";

import { useTransition } from "react";
import { deleteCommentAction } from "@/app/actions/interactions";

export default function DeleteCommentButton({
  commentId,
  episodeSlug,
}: {
  commentId: string;
  episodeSlug: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this comment? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteCommentAction(commentId, episodeSlug);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-[var(--color-vermillion)]/80 hover:text-[var(--color-vermillion)] disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
