import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EpisodeForm from "@/components/admin/EpisodeForm";

export const metadata = { title: "New Episode | Admin" };

export default async function NewEpisodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await prisma.story.findUnique({
    where: { id },
    include: { episodes: { orderBy: { orderIndex: "desc" }, take: 1 } },
  });

  if (!story) {
    notFound();
  }

  const nextOrderIndex = (story.episodes[0]?.orderIndex ?? 0) + 1;

  return (
    <div className="max-w-2xl">
      <h2 className="mb-1 font-[family-name:var(--font-display)] text-xl text-[var(--color-ivory)]">
        New episode
      </h2>
      <p className="mb-6 font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/50">
        in {story.title}
      </p>
      <EpisodeForm storyId={story.id} nextOrderIndex={nextOrderIndex} />
    </div>
  );
}
