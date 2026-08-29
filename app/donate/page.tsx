import { getSiteSetting } from "@/lib/data";

export const metadata = { title: "Donate | Shahnameh Tales" };

export default async function DonatePage() {
  const donateUrl = await getSiteSetting("donate_url");

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[var(--color-ivory)]">
        Support the project
      </h1>
      <p className="mx-auto mt-4 max-w-lg font-[family-name:var(--font-body)] text-lg leading-relaxed text-[var(--color-ivory)]/75">
        Shahnameh Tales is an independent retelling project. If you&rsquo;ve
        enjoyed the stories, consider supporting the work so more episodes
        can be written.
      </p>

      <div className="manuscript-divider my-10">
        <span className="lozenge" aria-hidden="true" />
      </div>

      {donateUrl ? (
        <a
          href={donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-sm bg-[var(--color-gold)] px-8 py-3 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)]"
        >
          Donate now
        </a>
      ) : (
        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/50">
          Donations aren&rsquo;t open yet — check back soon.
        </p>
      )}
    </div>
  );
}
