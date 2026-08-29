import Link from "next/link";
import { getPublishedStories } from "@/lib/data";
import StoryCard from "@/components/StoryCard";

export default async function HomePage() {
  const stories = await getPublishedStories();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, var(--color-gold) 0px, transparent 45%), radial-gradient(circle at 80% 60%, var(--color-vermillion) 0px, transparent 40%)",
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-24 md:py-32">
          <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.3em] text-[var(--color-gold-bright)]">
            The Book of Kings, retold
          </span>
          <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-[var(--color-ivory)] italic md:text-6xl">
            Ancient Persia&rsquo;s heroes,
            <br />
            <span className="not-italic text-[var(--color-gold-bright)]">
              one episode at a time.
            </span>
          </h1>
          <p className="max-w-xl font-[family-name:var(--font-body)] text-lg leading-relaxed text-[var(--color-ivory)]/75">
            The Shahnameh holds a thousand years of kings, monsters, and
            impossible loyalty. Here it&rsquo;s retold episode by episode —
            read along, mark your favorites, and follow the saga as it unfolds.
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/stories"
              className="rounded-sm bg-[var(--color-gold)] px-6 py-3 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-gold-bright)]"
            >
              Begin reading
            </Link>
            <Link
              href="/about"
              className="rounded-sm border border-[var(--color-line)] px-6 py-3 font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/90 transition-colors hover:border-[var(--color-gold)]"
            >
              About this project
            </Link>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="manuscript-divider mb-10">
          <span className="lozenge" aria-hidden="true" />
          <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.25em] text-[var(--color-gold)]">
            Sagas
          </span>
          <span className="lozenge" aria-hidden="true" />
        </div>

        {stories.length === 0 ? (
          <div className="rounded-sm border border-dashed border-[var(--color-line)] py-16 text-center">
            <p className="font-[family-name:var(--font-body)] text-[var(--color-ivory)]/60">
              The first tales are being prepared. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story, i) => (
              <StoryCard
                key={story.id}
                slug={story.slug}
                title={story.title}
                summary={story.summary}
                coverImage={story.coverImage}
                episodeCount={story._count.episodes}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
