"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStoryAction, updateStoryAction, deleteStoryAction } from "@/app/actions/admin";

interface StoryFormProps {
  story?: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    coverImage: string | null;
    published: boolean;
  };
}

export default function StoryForm({ story }: StoryFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = story
        ? await updateStoryAction(story.id, formData)
        : await createStoryAction(formData);

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      router.push("/admin/stories");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!story) return;
    if (
      !confirm(
        `Delete "${story.title}" and all its episodes, likes, and comments? This cannot be undone.`
      )
    )
      return;
    startDeleteTransition(async () => {
      await deleteStoryAction(story.id);
      router.push("/admin/stories");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <Field label="Title" name="title" defaultValue={story?.title} required />
      <Field
        label="Slug (URL path, lowercase, hyphens only)"
        name="slug"
        defaultValue={story?.slug}
        required
        pattern="[a-z0-9-]+"
      />
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Summary
        </span>
        <textarea
          name="summary"
          defaultValue={story?.summary}
          required
          rows={4}
          className="resize-none rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>
      <Field
        label="Cover image URL (optional)"
        name="coverImage"
        defaultValue={story?.coverImage ?? ""}
        type="url"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="published"
          defaultChecked={story?.published}
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
          {isPending ? "Saving..." : story ? "Save changes" : "Create story"}
        </button>
        {story && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)] hover:underline disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete story"}
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
