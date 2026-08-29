import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserByUsername } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return { title: `${username} | Shahnameh Tales` };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const session = await getSessionUser();
  const isOwnProfile = session?.userId === user.id;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-start gap-6">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/20 font-[family-name:var(--font-display)] text-3xl text-[var(--color-gold-bright)]">
            {(user.displayName || user.username)[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ivory)]">
                {user.displayName || user.username}
              </h1>
              <p className="font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/50">
                @{user.username}
              </p>
            </div>
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="rounded-sm border border-[var(--color-line)] px-4 py-1.5 font-[family-name:var(--font-ui)] text-sm text-[var(--color-ivory)]/80 transition-colors hover:border-[var(--color-gold)]"
              >
                Edit profile
              </Link>
            )}
          </div>
          {user.bio && (
            <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-[var(--color-ivory)]/75">
              {user.bio}
            </p>
          )}
          <div className="mt-4 flex gap-6 font-[family-name:var(--font-ui)] text-xs text-[var(--color-ivory)]/50">
            <span>{user._count.comments} comments</span>
            <span>{user._count.likes} likes given</span>
            <span>
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-14">
        <h2 className="mb-6 font-[family-name:var(--font-ui)] text-xs uppercase tracking-[0.25em] text-[var(--color-gold)]">
          Achievements
        </h2>
        {user.achievements.length === 0 ? (
          <p className="font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/50">
            No achievements unlocked yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {user.achievements.map(({ achievement, unlockedAt }) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center gap-2 rounded-sm border border-[var(--color-line)] bg-[var(--color-ink-deep)] p-4 text-center"
                title={achievement.description}
              >
                <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-gold-bright)]">
                  {achievement.icon || "★"}
                </span>
                <span className="font-[family-name:var(--font-ui)] text-xs font-medium text-[var(--color-ivory)]">
                  {achievement.title}
                </span>
                <span className="font-[family-name:var(--font-ui)] text-[10px] text-[var(--color-ivory)]/40">
                  {new Date(unlockedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
