"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingAction } from "@/app/actions/admin";

export default function SiteSettingForm({
  settingKey,
  label,
  placeholder,
  initialValue,
}: {
  settingKey: string;
  label: string;
  placeholder?: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateSiteSettingAction(settingKey, value);
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          {label}
        </span>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder={placeholder}
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="w-fit rounded-sm bg-[var(--color-gold)] px-5 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-bright)] disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        {saved && (
          <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-gold-bright)]">
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
