import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisodeBySlug, getAdjacentEpisodes } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);
  if (!episode) return {};
  return {
    title: `${episode.title} | Shahnameh Tales`,
    description: episode.excerpt ?? undefined,
  };
}

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const episode = await getEpisodeBySlug(slug);

  if (!episode || !episode.published) {
    notFound();
  }

  const session = await getSessionUser();
  const { previous, next } = await getAdjacentEpisodes(
    episode.storyId,
    episode.orderIndex
  );

  let initiallyLiked = false;
  if (session) {
    const like = await prisma.like.findUnique({
      where: { userId_episodeId: { userId: session.userId, episodeId: episode.id } },
    });
    initiallyLiked = !!like;
  }

  // Record reading progress for logged-in users (fire and forget, best-effort)
  if (session) {
    await prisma.readingProgress
      .upsert({
        where: {
          userId_episodeId: { userId: session.userId, episodeId: episode.id },
        },
        update: { readAt: new Date() },
        create: { userId: session.userId, episodeId: episode.id },
      })
      .catch(() => {});
  }

  return (
    <article>
      <section className="border-b border-[var(--color-line)] bg-[var(--color-ink-deep)]">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <Link
            href={`/stories/${episode.story.slug}`}
            className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-gold-bright)] hover:underline"
          >
            ← {episode.story.title}
          </Link>
          <p className="mt-4 font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.25em] text-[var(--color-gold)]">
            Episode {String(episode.orderIndex).padStart(2, "0")}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[var(--color-ivory)] md:text-5xl">
            {episode.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-14">
        {/* Story body. Content is stored as plain paragraphs separated by
            blank lines; swap this for a markdown renderer later if desired. */}
        <div className="flex flex-col gap-5 font-[family-name:var(--font-body)] text-lg leading-relaxed text-[var(--color-ivory)]/90">
          {episode.content.split(/\n\s*\n/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-4">
          <LikeButton
            episodeId={episode.id}
            episodeSlug={episode.slug}
            initialLiked={initiallyLiked}
            initialCount={episode._count.likes}
            isLoggedIn={!!session}
          />
        </div>

        {/* Prev / Next navigation */}
        <div className="manuscript-divider my-12">
          <span className="lozenge" aria-hidden="true" />
        </div>
        <nav className="flex items-center justify-between gap-4">
          {previous ? (
            <Link
              href={`/episodes/${previous.slug}`}
              className="flex-1 rounded-sm border border-[var(--color-line)] p-4 transition-colors hover:border-[var(--color-gold)]"
            >
              <span className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/50">
                ← Previous
              </span>
              <p className="mt-1 font-[family-name:var(--font-display)] text-[var(--color-ivory)]">
                {previous.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {next ? (
            <Link
              href={`/episodes/${next.slug}`}
              className="flex-1 rounded-sm border border-[var(--color-line)] p-4 text-right transition-colors hover:border-[var(--color-gold)]"
            >
              <span className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/50">
                Next →
              </span>
              <p className="mt-1 font-[family-name:var(--font-display)] text-[var(--color-ivory)]">
                {next.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>

        {/* Comments */}
        <div className="mt-16">
          <h2 className="mb-6 font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.25em] text-[var(--color-gold)]">
            Comments ({episode.comments.length})
          </h2>

          {session ? (
            <div className="mb-8">
              <CommentForm episodeId={episode.id} />
            </div>
          ) : (
            <p className="mb-8 font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/60">
              <Link
                href={`/login?next=/episodes/${episode.slug}`}
                className="text-[var(--color-gold-bright)] hover:underline"
              >
                Log in
              </Link>{" "}
              to join the conversation.
            </p>
          )}

          <CommentList
            comments={episode.comments}
            episodeId={episode.id}
            episodeSlug={episode.slug}
            currentUserId={session?.userId}
            isAdmin={session?.role === "ADMIN"}
            isLoggedIn={!!session}
          />
        </div>
      </section>
    </article>
  );
}
