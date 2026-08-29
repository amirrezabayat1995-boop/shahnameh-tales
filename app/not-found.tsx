import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-32 text-center">
      <p className="font-[family-name:var(--font-display)] text-6xl italic text-[var(--color-gold)]">
        404
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl text-[var(--color-ivory)]">
        This page isn&rsquo;t part of the tale.
      </h1>
      <p className="mt-3 font-[family-name:var(--font-body)] text-[var(--color-ivory)]/60">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have
        moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-sm bg-[var(--color-gold)] px-6 py-3 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-bright)]"
      >
        Return home
      </Link>
    </div>
  );
}
