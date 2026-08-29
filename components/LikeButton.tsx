"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleLikeAction } from "@/app/actions/interactions";

interface LikeButtonProps {
  episodeId: string;
  episodeSlug: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}

export default function LikeButton({
  episodeId,
  episodeSlug,
  initialLiked,
  initialCount,
  isLoggedIn,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=/episodes/${episodeSlug}`);
      return;
    }

    // Optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => (nextLiked ? c + 1 : c - 1));

    startTransition(async () => {
      const result = await toggleLikeAction(episodeId, episodeSlug);
      if (!result.success) {
        // revert on failure
        setLiked(liked);
        setCount(count);
      } else if (typeof result.likeCount === "number") {
        setCount(result.likeCount);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      className={`flex items-center gap-2 rounded-sm border px-4 py-2 font-[family-name:var(--font-ui)] text-sm transition-colors disabled:opacity-60 ${
        liked
          ? "border-[var(--color-vermillion)] bg-[var(--color-vermillion)]/15 text-[var(--color-vermillion)]"
          : "border-[var(--color-line)] text-[var(--color-ivory)]/80 hover:border-[var(--color-gold)] hover:text-[var(--color-gold-bright)]"
      }`}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
      <span className="sr-only">{liked ? "Unlike this episode" : "Like this episode"}</span>
    </button>
  );
}
