"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createEpisodeAction,
  updateEpisodeAction,
  deleteEpisodeAction,
} from "@/app/actions/admin";

interface EpisodeFormProps {
  storyId: string;
  nextOrderIndex: number;
  episode?: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    coverImage: string | null;
    orderIndex: number;
    published: boolean;
  };
}

export default function EpisodeForm({
  storyId,
  nextOrderIndex,
  episode,
}: EpisodeFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("storyId", storyId);
    startTransition(async () => {
      const result = episode
        ? await updateEpisodeAction(episode.id, formData)
        : await createEpisodeAction(formData);

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      router.push(`/admin/stories/${storyId}`);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!episode) return;
    if (!confirm(`Delete episode "${episode.title}"? This cannot be undone.`)) return;
    startDeleteTransition(async () => {
      await deleteEpisodeAction(episode.id);
      router.push(`/admin/stories/${storyId}`);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <Field label="Title" name="title" defaultValue={episode?.title} required />
      <Field
        label="Slug (URL path, lowercase, hyphens only)"
        name="slug"
        defaultValue={episode?.slug}
        required
        pattern="[a-z0-9-]+"
      />
      <Field
        label="Order (episode number within this story)"
        name="orderIndex"
        type="number"
        defaultValue={String(episode?.orderIndex ?? nextOrderIndex)}
        required
      />
      <Field
        label="Excerpt (short preview text, optional)"
        name="excerpt"
        defaultValue={episode?.excerpt ?? ""}
      />
      <Field
        label="Cover image URL (optional)"
        name="coverImage"
        defaultValue={episode?.coverImage ?? ""}
        type="url"
      />
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Content (separate paragraphs with a blank line)
        </span>
        <textarea
          name="content"
          defaultValue={episode?.content}
          required
          rows={16}
          className="resize-y rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          defaultChecked={episode?.published}
          className="h-4 w-4 accent-[var(--color-gold)]"
        />
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Published (visible to readers)
        </span>
      </label>

      {error && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-[var(--color-gold)] px-6 py-2.5 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-bright)] disabled:opacity-60"
        >
          {isPending ? "Saving..." : episode ? "Save changes" : "Create episode"}
        </button>
        {episode && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)] hover:underline disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete episode"}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  pattern,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  pattern?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        pattern={pattern}
        className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
      />
    </label>
  );
}
