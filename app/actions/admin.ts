"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { storySchema, episodeSchema, glossaryTermSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireAdmin() {
  const session = await getSessionUser();
  if (!session || session.role !== "ADMIN") {
    return null;
  }
  return session;
}

// ── Stories ────────────────────────────────────────────────

export async function createStoryAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    coverImage: formData.get("coverImage") || undefined,
    published: formData.get("published") === "on",
  };

  const parsed = storySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await prisma.story.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, error: "A story with that slug already exists" };
  }

  await prisma.story.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      summary: parsed.data.summary,
      coverImage: parsed.data.coverImage || null,
      published: parsed.data.published ?? false,
    },
  });

  revalidatePath("/stories");
  revalidatePath("/admin/stories");

  return { success: true };
}

export async function updateStoryAction(
  storyId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    coverImage: formData.get("coverImage") || undefined,
    published: formData.get("published") === "on",
  };

  const parsed = storySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.story.update({
    where: { id: storyId },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      summary: parsed.data.summary,
      coverImage: parsed.data.coverImage || null,
      published: parsed.data.published ?? false,
    },
  });

  revalidatePath("/stories");
  revalidatePath(`/stories/${parsed.data.slug}`);
  revalidatePath("/admin/stories");

  return { success: true };
}

export async function deleteStoryAction(storyId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  await prisma.story.delete({ where: { id: storyId } });

  revalidatePath("/stories");
  revalidatePath("/admin/stories");

  return { success: true };
}

// ── Episodes ───────────────────────────────────────────────

export async function createEpisodeAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    orderIndex: Number(formData.get("orderIndex")),
    storyId: formData.get("storyId"),
    published: formData.get("published") === "on",
  };

  const parsed = episodeSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existingSlug = await prisma.episode.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existingSlug) {
    return { success: false, error: "An episode with that slug already exists" };
  }

  const published = parsed.data.published ?? false;

  await prisma.episode.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || null,
      coverImage: parsed.data.coverImage || null,
      orderIndex: parsed.data.orderIndex,
      storyId: parsed.data.storyId,
      published,
      publishedAt: published ? new Date() : null,
    },
  });

  revalidatePath("/stories");
  revalidatePath("/admin/stories");

  return { success: true };
}

export async function updateEpisodeAction(
  episodeId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  const raw = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content"),
    excerpt: formData.get("excerpt") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    orderIndex: Number(formData.get("orderIndex")),
    storyId: formData.get("storyId"),
    published: formData.get("published") === "on",
  };

  const parsed = episodeSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const current = await prisma.episode.findUnique({ where: { id: episodeId } });
  const published = parsed.data.published ?? false;
  const justPublished = published && current && !current.published;

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || null,
      coverImage: parsed.data.coverImage || null,
      orderIndex: parsed.data.orderIndex,
      storyId: parsed.data.storyId,
      published,
      publishedAt: justPublished ? new Date() : current?.publishedAt,
    },
  });

  revalidatePath("/stories");
  revalidatePath(`/episodes/${parsed.data.slug}`);
  revalidatePath("/admin/stories");

  return { success: true };
}

export async function deleteEpisodeAction(episodeId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  await prisma.episode.delete({ where: { id: episodeId } });

  revalidatePath("/stories");
  revalidatePath("/admin/stories");

  return { success: true };
}

// ── Site settings (e.g. donate link) ──────────────────────

export async function updateSiteSettingAction(
  key: string,
  value: string
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  revalidatePath("/donate");
  revalidatePath("/admin/settings");

  return { success: true };
}

// ── Glossary Terms ─────────────────────────────────────────

export async function createGlossaryTermAction(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  const raw = {
    term: formData.get("term"),
    title: formData.get("title"),
    definition: formData.get("definition"),
    type: formData.get("type") || "TERM",
  };

  const parsed = glossaryTermSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Normalize the matching key: lowercase + trimmed, so [[Rostam]] and
  // [[rostam]] both resolve to the same term regardless of how the admin
  // typed it in.
  const normalizedTerm = parsed.data.term.trim().toLowerCase();

  const existing = await prisma.glossaryTerm.findUnique({
    where: { term: normalizedTerm },
  });
  if (existing) {
    return { success: false, error: "A glossary term with that key already exists" };
  }

  await prisma.glossaryTerm.create({
    data: {
      term: normalizedTerm,
      title: parsed.data.title,
      definition: parsed.data.definition,
      type: parsed.data.type,
    },
  });

  revalidatePath("/admin/glossary");
  // Glossary terms are read on every episode page, so bust those too.
  revalidatePath("/episodes/[slug]", "page");

  return { success: true };
}

export async function updateGlossaryTermAction(
  glossaryTermId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  const raw = {
    term: formData.get("term"),
    title: formData.get("title"),
    definition: formData.get("definition"),
    type: formData.get("type") || "TERM",
  };

  const parsed = glossaryTermSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const normalizedTerm = parsed.data.term.trim().toLowerCase();

  const conflict = await prisma.glossaryTerm.findFirst({
    where: { term: normalizedTerm, NOT: { id: glossaryTermId } },
  });
  if (conflict) {
    return { success: false, error: "A glossary term with that key already exists" };
  }

  await prisma.glossaryTerm.update({
    where: { id: glossaryTermId },
    data: {
      term: normalizedTerm,
      title: parsed.data.title,
      definition: parsed.data.definition,
      type: parsed.data.type,
    },
  });

  revalidatePath("/admin/glossary");
  revalidatePath("/episodes/[slug]", "page");

  return { success: true };
}

export async function deleteGlossaryTermAction(glossaryTermId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (!session) return { success: false, error: "Admin access required" };

  await prisma.glossaryTerm.delete({ where: { id: glossaryTermId } });

  revalidatePath("/admin/glossary");
  revalidatePath("/episodes/[slug]", "page");

  return { success: true };
}
