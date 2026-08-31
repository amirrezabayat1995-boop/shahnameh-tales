import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login?next=/admin");
  }
  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ivory)]">
          Admin
        </h1>
        <nav className="flex gap-6 font-[family-name:var(--font-ui)] text-sm">
          <Link
            href="/admin/stories"
            className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-bright)]"
          >
            Stories & Episodes
          </Link>
          <Link
            href="/admin/glossary"
            className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-bright)]"
          >
            Glossary
          </Link>
          <Link
            href="/admin/settings"
            className="text-[var(--color-ivory)]/80 hover:text-[var(--color-gold-bright)]"
          >
            Site Settings
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
