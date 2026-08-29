import Link from "next/link";
import { notFound } from "next/navigation";
import { getStoryBySlug } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return {};
  return {
    title: `${story.title} | Shahnameh Tales`,
    description: story.summary,
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story || !story.published) {
    notFound();
  }

  return (
    <div>
      <section className="border-b border-[var(--color-line)] bg-[var(--color-ink-deep)]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <Link
            href="/stories"
            className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-gold-bright)] hover:underline"
          >
            ← All sagas
          </Link>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[var(--color-ivory)] md:text-5xl">
            {story.title}
          </h1>
          <p className="mt-4 max-w-2xl font-[family-name:var(--font-body)] text-lg leading-relaxed text-[var(--color-ivory)]/75">
            {story.summary}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="mb-8 font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.25em] text-[var(--color-gold)]">
          Episodes
        </h2>

        {story.episodes.length === 0 ? (
          <p className="font-[family-name:var(--font-body)] text-[var(--color-ivory)]/60">
            No episodes have been published yet.
          </p>
        ) : (
          <ol className="flex flex-col divide-y divide-[var(--color-line)]">
            {story.episodes.map((episode) => (
              <li key={episode.id}>
                <Link
                  href={`/episodes/${episode.slug}`}
                  className="group flex items-center justify-between gap-6 py-5 transition-colors hover:bg-[var(--color-ink-deep)]"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-[family-name:var(--font-display)] text-2xl italic text-[var(--color-gold)]">
                      {String(episode.orderIndex).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-ivory)] group-hover:text-[var(--color-gold-bright)]">
                        {episode.title}
                      </h3>
                      {episode.excerpt && (
                        <p className="mt-1 line-clamp-1 font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/60">
                          {episode.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-3 font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/50">
                    <span>{episode._count.likes} likes</span>
                    <span>{episode._count.comments} comments</span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
