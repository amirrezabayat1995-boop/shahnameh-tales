"use client";

import { useRef, useState, useTransition } from "react";
import { addCommentAction } from "@/app/actions/interactions";

interface CommentFormProps {
  episodeId: string;
  parentId?: string;
  onDone?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  episodeId,
  parentId,
  onDone,
  placeholder = "Share your thoughts on this episode...",
}: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addCommentAction(formData);
      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      formRef.current?.reset();
      onDone?.();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="episodeId" value={episodeId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <textarea
        name="content"
        required
        maxLength={2000}
        rows={parentId ? 2 : 3}
        placeholder={placeholder}
        className="w-full resize-none rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-3 font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ivory)]/40 focus:border-[var(--color-gold)] focus:outline-none"
      />
      {error && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)]">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-[var(--color-gold)] px-5 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)] disabled:opacity-60"
        >
          {isPending ? "Posting..." : parentId ? "Reply" : "Post comment"}
        </button>
      </div>
    </form>
  );
}
