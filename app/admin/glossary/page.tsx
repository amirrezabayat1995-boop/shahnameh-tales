import Link from "next/link";
import { getAllGlossaryTerms } from "@/lib/data";

export const metadata = { title: "Admin: Glossary | Shahnameh Tales" };

const TYPE_LABEL: Record<string, string> = {
  CHARACTER: "Character",
  PLACE: "Place",
  TERM: "Term",
};

export default async function AdminGlossaryPage() {
  const terms = await getAllGlossaryTerms();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
            Glossary
          </h2>
          <p className="mt-1 font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/50">
            Mark words in episode content with [[Term]] to link them here.
          </p>
        </div>
        <Link
          href="/admin/glossary/new"
          className="rounded-sm bg-[var(--color-gold)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-bright)]"
        >
          + New term
        </Link>
      </div>

      {terms.length === 0 ? (
        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/60">
          No glossary terms yet. Create your first one.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
          {terms.map((term) => (
            <Link
              key={term.id}
              href={`/admin/glossary/${term.id}`}
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--color-ink-deep)]"
            >
              <div>
                <p className="font-[family-name:var(--font-ui)] font-medium text-[var(--color-ivory)]">
                  {term.title}
                </p>
                <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/50">
                  [[{term.term}]]
                </p>
              </div>
              <span className="rounded-full bg-[var(--color-gold)]/20 px-3 py-1 font-[family-name:var(--font-ui)] text-xs text-[var(--color-gold-bright)]">
                {TYPE_LABEL[term.type]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
