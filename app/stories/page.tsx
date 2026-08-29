import { getPublishedStories } from "@/lib/data";
import StoryCard from "@/components/StoryCard";

export const metadata = {
  title: "All Sagas | Shahnameh Tales",
};

export default async function StoriesPage() {
  const stories = await getPublishedStories();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold italic text-[var(--color-ivory)]">
        All Sagas
      </h1>
      <p className="mt-3 max-w-xl font-[family-name:var(--font-body)] text-[var(--color-ivory)]/70">
        Every saga currently being told, from first episode to latest.
      </p>

      <div className="mt-12">
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
      </div>
    </div>
  );
}
