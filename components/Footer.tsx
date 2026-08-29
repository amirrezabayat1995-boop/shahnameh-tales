import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-ink-deep)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="manuscript-divider mb-8">
          <span className="lozenge" aria-hidden="true" />
        </div>
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg text-[var(--color-ivory)]">
              Shahnameh Tales
            </p>
            <p className="mt-1 font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/50">
              Stories from the Book of Kings, retold episode by episode.
            </p>
          </div>
          <div className="flex gap-6 font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/70">
            <Link href="/about" className="hover:text-[var(--color-gold-bright)]">
              About
            </Link>
            <Link href="/contact" className="hover:text-[var(--color-gold-bright)]">
              Contact
            </Link>
            <Link href="/donate" className="hover:text-[var(--color-gold-bright)]">
              Donate
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/40">
          © {new Date().getFullYear()} Shahnameh Tales. An independent retelling project.
        </p>
      </div>
    </footer>
  );
}
