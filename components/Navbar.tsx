import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const session = await getSessionUser();

  const navLinks = [
    { href: "/stories", label: "Stories" },
    { href: "/about", label: "About" },
    { href: "/donate", label: "Donate" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-ink)]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-wide text-[var(--color-ivory)]"
        >
          Shahnameh <span className="text-[var(--color-gold-bright)]">Tales</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-[family-name:var(--font-ui)] text-sm tracking-wide text-[var(--color-ivory)]/80 transition-colors hover:text-[var(--color-gold-bright)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              {session.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-gold-bright)] hover:underline"
                >
                  Admin
                </Link>
              )}
              <Link
                href={`/profile/${session.username}`}
                className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/90 hover:text-[var(--color-gold-bright)]"
              >
                {session.username}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/90 hover:text-[var(--color-gold-bright)]"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-sm border border-[var(--color-gold)] px-4 py-1.5 font-[family-name:var(--font-ui)] text-sm text-[var(--color-gold-bright)] transition-colors hover:bg-[var(--color-gold)] hover:text-[var(--color-ink)]"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
