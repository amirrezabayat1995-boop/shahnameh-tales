import Link from "next/link";

interface StoryCardProps {
  slug: string;
  title: string;
  summary: string;
  coverImage: string | null;
  episodeCount: number;
  index: number;
}

export default function StoryCard({
  slug,
  title,
  summary,
  coverImage,
  episodeCount,
  index,
}: StoryCardProps) {
  return (
    <Link
      href={`/stories/${slug}`}
      className="group fade-in-up flex flex-col overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] transition-colors hover:border-[var(--color-gold)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="relative flex h-48 items-end overflow-hidden bg-gradient-to-br from-[var(--color-ink-deep)] to-[var(--color-ink)] p-5"
        style={
          coverImage
            ? {
                backgroundImage: `linear-gradient(to top, rgba(19,31,56,0.95), rgba(19,31,56,0.3)), url(${coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <span className="font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.2em] text-[var(--color-gold-bright)]">
          {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-ivory)] transition-colors group-hover:text-[var(--color-gold-bright)]">
          {title}
        </h3>
        <p className="line-clamp-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[var(--color-ivory)]/70">
          {summary}
        </p>
      </div>
    </Link>
  );
}
