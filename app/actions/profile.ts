"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { success: false, error: "You must be logged in" };
  }

  const raw = {
    displayName: formData.get("displayName") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      avatarUrl: parsed.data.avatarUrl || undefined,
    },
  });

  revalidatePath(`/profile/${session.username}`);

  return { success: true };
}
