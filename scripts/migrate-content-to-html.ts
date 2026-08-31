/**
 * One-off migration: converts existing Episode.content from plain text
 * (paragraphs separated by blank lines, the old format) into HTML
 * (<p>...</p> per paragraph, the format the new rich-text editor expects).
 *
 * Safe to run multiple times — it skips any episode whose content already
 * looks like HTML (starts with a `<` tag) so it won't double-wrap.
 *
 * Run with: npx tsx scripts/migrate-content-to-html.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function plainTextToHtml(content: string): string {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

async function main() {
  const episodes = await prisma.episode.findMany({
    select: { id: true, title: true, content: true },
  });

  let migrated = 0;
  let skipped = 0;

  for (const episode of episodes) {
    const trimmed = episode.content.trim();
    if (trimmed.startsWith("<")) {
      console.log(`Skipping "${episode.title}" — already looks like HTML.`);
      skipped++;
      continue;
    }

    const html = plainTextToHtml(episode.content);
    await prisma.episode.update({
      where: { id: episode.id },
      data: { content: html },
    });
    console.log(`Migrated "${episode.title}".`);
    migrated++;
  }

  console.log(`\nDone. Migrated ${migrated}, skipped ${skipped} (already HTML).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
