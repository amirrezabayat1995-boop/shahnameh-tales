import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin: Stories | Shahnameh Tales" };

export default async function AdminStoriesPage() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { episodes: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
          Stories
        </h2>
        <Link
          href="/admin/stories/new"
          className="rounded-sm bg-[var(--color-gold)] px-4 py-2 font-[family-name:var(--font-ui)] text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-gold-bright)]"
        >
          + New story
        </Link>
      </div>

      {stories.length === 0 ? (
        <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/60">
          No stories yet. Create your first one.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/admin/stories/${story.id}`}
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-[var(--color-ink-deep)]"
            >
              <div>
                <p className="font-[family-name:var(--font-ui)] font-medium text-[var(--color-ivory)]">
                  {story.title}
                </p>
                <p className="font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/50">
                  /{story.slug} · {story._count.episodes} episodes
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 font-[family-name:var(--font-ui)] text-xs ${
                  story.published
                    ? "bg-[var(--color-gold)]/20 text-[var(--color-gold-bright)]"
                    : "bg-[var(--color-ivory)]/10 text-[var(--color-ivory)]/50"
                }`}
              >
                {story.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
