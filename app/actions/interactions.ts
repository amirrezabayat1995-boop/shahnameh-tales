"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { commentSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ── Likes ──────────────────────────────────────────────────

export async function toggleLikeAction(
  episodeId: string,
  episodeSlug: string
): Promise<ActionResult & { liked?: boolean; likeCount?: number }> {
  const session = await getSessionUser();
  if (!session) {
    return { success: false, error: "You must be logged in to like an episode" };
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_episodeId: { userId: session.userId, episodeId },
    },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: { userId: session.userId, episodeId },
    });
  }

  const likeCount = await prisma.like.count({ where: { episodeId } });

  revalidatePath(`/episodes/${episodeSlug}`);

  return { success: true, liked: !existing, likeCount };
}

// ── Comments ───────────────────────────────────────────────

export async function addCommentAction(formData: FormData): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { success: false, error: "You must be logged in to comment" };
  }

  const raw = {
    content: formData.get("content"),
    episodeId: formData.get("episodeId"),
    parentId: formData.get("parentId") || undefined,
  };

  const parsed = commentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const episode = await prisma.episode.findUnique({
    where: { id: parsed.data.episodeId },
    select: { slug: true },
  });
  if (!episode) {
    return { success: false, error: "Episode not found" };
  }

  await prisma.comment.create({
    data: {
      content: parsed.data.content,
      episodeId: parsed.data.episodeId,
      parentId: parsed.data.parentId || null,
      userId: session.userId,
    },
  });

  revalidatePath(`/episodes/${episode.slug}`);

  return { success: true };
}

export async function deleteCommentAction(
  commentId: string,
  episodeSlug: string
): Promise<ActionResult> {
  const session = await getSessionUser();
  if (!session) {
    return { success: false, error: "You must be logged in" };
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return { success: false, error: "Comment not found" };
  }

  // Only the comment's author or an admin can delete it
  if (comment.userId !== session.userId && session.role !== "ADMIN") {
    return { success: false, error: "You cannot delete this comment" };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/episodes/${episodeSlug}`);

  return { success: true };
}
