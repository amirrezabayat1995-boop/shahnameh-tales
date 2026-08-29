"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/actions/profile";

interface ProfileEditFormProps {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export default function ProfileEditForm({
  username,
  displayName,
  bio,
  avatarUrl,
}: ProfileEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Display name
        </span>
        <input
          name="displayName"
          defaultValue={displayName ?? ""}
          maxLength={50}
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Avatar URL
        </span>
        <input
          name="avatarUrl"
          type="url"
          defaultValue={avatarUrl ?? ""}
          placeholder="https://..."
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] placeholder:text-[var(--color-ivory)]/40 focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Bio
        </span>
        <textarea
          name="bio"
          defaultValue={bio ?? ""}
          maxLength={500}
          rows={4}
          className="resize-none rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>

      {error && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)]">
          {error}
        </p>
      )}
      {success && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-gold-bright)]">
          Profile updated.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-[var(--color-gold)] px-6 py-2.5 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)] disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
