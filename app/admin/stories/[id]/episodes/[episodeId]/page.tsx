import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EpisodeForm from "@/components/admin/EpisodeForm";

export const metadata = { title: "Edit Episode | Admin" };

export default async function EditEpisodePage({
  params,
}: {
  params: Promise<{ id: string; episodeId: string }>;
}) {
  const { id, episodeId } = await params;
  const [story, episode] = await Promise.all([
    prisma.story.findUnique({ where: { id } }),
    prisma.episode.findUnique({ where: { id: episodeId } }),
  ]);

  if (!story || !episode || episode.storyId !== story.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
        Edit episode
      </h2>
      <p className="mb-6 font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/50">
        in {story.title}
      </p>
      <EpisodeForm storyId={story.id} nextOrderIndex={episode.orderIndex} episode={episode} />
    </div>
  );
}
