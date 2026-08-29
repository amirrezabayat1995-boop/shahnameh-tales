import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileEditForm from "@/components/ProfileEditForm";

export const metadata = { title: "Edit Profile | Shahnameh Tales" };

export default async function ProfileEditPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?next=/profile/edit");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { username: true, displayName: true, bio: true, avatarUrl: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold italic text-[var(--color-ivory)]">
        Edit profile
      </h1>
      <p className="mt-2 mb-8 font-[family-name:var(--font-body)] text-sm text-[var(--color-ivory)]/60">
        Update how you appear to other readers.
      </p>
      <ProfileEditForm
        username={user.username}
        displayName={user.displayName}
        bio={user.bio}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}
