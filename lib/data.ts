import { prisma } from "@/lib/prisma";

// Centralizing these queries makes it easy to add caching, pagination,
// or filtering later without touching every page that needs story data.

export async function getPublishedStories() {
  return prisma.story.findMany({
    where: { published: true },
    include: {
      episodes: {
        where: { published: true },
        orderBy: { orderIndex: "asc" },
        select: { id: true, slug: true, title: true, orderIndex: true },
      },
      _count: {
        select: { episodes: { where: { published: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getStoryBySlug(slug: string) {
  return prisma.story.findUnique({
    where: { slug },
    include: {
      episodes: {
        where: { published: true },
        orderBy: { orderIndex: "asc" },
        include: {
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });
}

export async function getEpisodeBySlug(slug: string) {
  return prisma.episode.findUnique({
    where: { slug },
    include: {
      story: true,
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true, displayName: true, avatarUrl: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            include: {
              user: {
                select: { username: true, displayName: true, avatarUrl: true },
              },
            },
          },
        },
      },
      _count: { select: { likes: true } },
    },
  });
}

export async function getAdjacentEpisodes(storyId: string, orderIndex: number) {
  const [previous, next] = await Promise.all([
    prisma.episode.findFirst({
      where: { storyId, orderIndex: { lt: orderIndex }, published: true },
      orderBy: { orderIndex: "desc" },
      select: { slug: true, title: true, orderIndex: true },
    }),
    prisma.episode.findFirst({
      where: { storyId, orderIndex: { gt: orderIndex }, published: true },
      orderBy: { orderIndex: "asc" },
      select: { slug: true, title: true, orderIndex: true },
    }),
  ]);
  return { previous, next };
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      achievements: {
        orderBy: { unlockedAt: "desc" },
        include: { achievement: true },
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  });
}

export async function getSiteSetting(key: string): Promise<string | null> {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

// ── Glossary ───────────────────────────────────────────────

export interface GlossaryTermLookup {
  term: string; // normalized lowercase key
  title: string;
  definition: string;
  type: "CHARACTER" | "PLACE" | "TERM";
}

// Returns all glossary terms as a lookup map keyed by the normalized term,
// so EpisodeBody can resolve [[Term]] markup in O(1) per match instead of
// querying per-term while rendering.
export async function getGlossaryLookup(): Promise<Record<string, GlossaryTermLookup>> {
  const terms = await prisma.glossaryTerm.findMany({
    select: { term: true, title: true, definition: true, type: true },
  });

  return Object.fromEntries(terms.map((t) => [t.term, t]));
}

// For the admin list page.
export async function getAllGlossaryTerms() {
  return prisma.glossaryTerm.findMany({
    orderBy: { title: "asc" },
  });
}
