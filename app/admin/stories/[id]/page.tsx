import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoryForm from "@/components/admin/StoryForm";

export const metadata = { title: "Edit Story | Admin" };

export default async function AdminStoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      episodes: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!story) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
          Edit story
        </h2>
        <StoryForm story={story} />
      </div>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
            Episodes
          </h2>
          <Link
            href={`/admin/stories/${story.id}/episodes/new`}
            className="rounded-sm bg-[var(--color-gold)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-bright)]"
          >
            + New episode
          </Link>
        </div>

        {story.episodes.length === 0 ? (
          <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/60">
            No episodes yet.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
            {story.episodes.map((episode) => (
              <Link
                key={episode.id}
                href={`/admin/stories/${story.id}/episodes/${episode.id}`}
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--color-ink-deep)]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-display)] text-[var(--color-gold)]">
                    {String(episode.orderIndex).padStart(2, "0")}
                  </span>
                  <span className="font-[family-name:var(--font-ui)] text-[var(--color-ivory)]">
                    {episode.title}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 font-[family-name:var(--font-ui)] text-xs ${
                    episode.published
                      ? "bg-[var(--color-gold)]/20 text-[var(--color-gold-bright)]"
                      : "bg-[var(--color-ivory)]/10 text-[var(--color-ivory)]/50"
                  }`}
                >
                  {episode.published ? "Published" : "Draft"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
