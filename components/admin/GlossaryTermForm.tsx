"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createGlossaryTermAction,
  updateGlossaryTermAction,
  deleteGlossaryTermAction,
} from "@/app/actions/admin";

interface GlossaryTermFormProps {
  glossaryTerm?: {
    id: string;
    term: string;
    title: string;
    definition: string;
    type: "CHARACTER" | "PLACE" | "TERM";
  };
}

export default function GlossaryTermForm({ glossaryTerm }: GlossaryTermFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = glossaryTerm
        ? await updateGlossaryTermAction(glossaryTerm.id, formData)
        : await createGlossaryTermAction(formData);

      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      router.push("/admin/glossary");
      router.refresh();
    });
  }

  function handleDelete() {
    if (!glossaryTerm) return;
    if (!confirm(`Delete the glossary term "${glossaryTerm.title}"? This cannot be undone.`))
      return;
    startDeleteTransition(async () => {
      await deleteGlossaryTermAction(glossaryTerm.id);
      router.push("/admin/glossary");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Term (used in episode markup as [[{glossaryTerm?.term || "term"}]])
        </span>
        <input
          name="term"
          defaultValue={glossaryTerm?.term}
          required
          maxLength={100}
          placeholder="Rostam"
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] placeholder:text-[var(--color-ivory)]/40 focus:border-[var(--color-gold)] focus:outline-none"
        />
        <span className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/40">
          Matching is case-insensitive — [[Rostam]] and [[rostam]] both resolve to this.
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Display title
        </span>
        <input
          name="title"
          defaultValue={glossaryTerm?.title}
          required
          maxLength={100}
          placeholder="Rostam"
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] placeholder:text-[var(--color-ivory)]/40 focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Type
        </span>
        <select
          name="type"
          defaultValue={glossaryTerm?.type ?? "TERM"}
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-ui)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        >
          <option value="CHARACTER">Character</option>
          <option value="PLACE">Place</option>
          <option value="TERM">Term</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Definition
        </span>
        <textarea
          name="definition"
          defaultValue={glossaryTerm?.definition}
          required
          rows={4}
          maxLength={1000}
          placeholder="The greatest of Persia's champions, hero of Zabulistan..."
          className="resize-none rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] placeholder:text-[var(--color-ivory)]/40 focus:border-[var(--color-gold)] focus:outline-none"
        />
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
          {isPending ? "Saving..." : glossaryTerm ? "Save changes" : "Create term"}
        </button>
        {glossaryTerm && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)] hover:underline disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete term"}
          </button>
        )}
      </div>
    </form>
  );
}
