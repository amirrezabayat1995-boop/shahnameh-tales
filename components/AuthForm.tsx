"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction, loginAction } from "@/app/actions/auth";

interface AuthFormProps {
  mode: "login" | "register";
  redirectTo: string;
}

export default function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const action = mode === "register" ? registerAction : loginAction;
      const result = await action(formData);
      if (!result.success) {
        setError(result.error ?? "Something went wrong");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold italic text-[var(--color-ivory)]">
          {mode === "register" ? "Join the saga" : "Welcome back"}
        </h1>
        <p className="mt-2 font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/60">
          {mode === "register"
            ? "Create an account to like, comment, and track your reading."
            : "Log in to continue your journey through the Shahnameh."}
        </p>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" ? (
          <>
            <Field label="Username" name="username" autoComplete="username" required />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </>
        ) : (
          <Field
            label="Username or email"
            name="identifier"
            autoComplete="username"
            required
          />
        )}
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          required
        />

        {error && (
          <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-vermillion)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 rounded-sm bg-[var(--color-gold)] px-6 py-3 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)] disabled:opacity-60"
        >
          {isPending
            ? "Please wait..."
            : mode === "register"
              ? "Create account"
              : "Log in"}
        </button>
      </form>

      <p className="text-center font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/60">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-gold-bright)] hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href="/register"
              className="text-[var(--color-gold-bright)] hover:underline"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80">
        {label}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] px-4 py-2.5 font-[family-name:var(--font-body)] text-[var(--color-ivory)] focus:border-[var(--color-gold)] focus:outline-none"
      />
    </label>
  );
}
