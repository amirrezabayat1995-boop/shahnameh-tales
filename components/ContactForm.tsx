"use client";

import { useRef, useState, useTransition } from "react";
import { submitContactAction } from "@/app/actions/contact";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitContactAction(formData);
      if (!result.success) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      formRef.current?.reset();
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div className="rounded-sm border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-6 text-center">
        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--color-gold-bright)]">
          Message sent.
        </p>
        <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/70">
          Thank you for reaching out. We&rsquo;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Name
        </span>
        <input
          name="name"
          required
          maxLength={100}
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
          Message
        </span>
        <textarea
          name="message"
          required
          maxLength={3000}
          rows={6}
          className="resize-none rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
        />
      </label>

      {error && (
        <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)]">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-sm bg-[var(--color-gold)] px-6 py-2.5 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)] disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
