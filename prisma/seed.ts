/**
 * Seed script — creates an initial admin account, a couple of sample
 * achievements, and one sample story with two episodes so you can see the
 * site working immediately.
 *
 * Run with: npm run db:seed
 *
 * IMPORTANT: change the admin password immediately after your first login,
 * or better, edit ADMIN_PASSWORD below before running this in production.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "ChangeMe123!"; // change this before/after seeding

async function main() {
  console.log("Seeding database...");

  // ── Admin user ─────────────────────────────────────────
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      passwordHash,
      displayName: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${admin.username} (password: ${ADMIN_PASSWORD})`);

  // ── Achievements ───────────────────────────────────────
  const achievements = [
    {
      key: "first_comment",
      title: "First Words",
      description: "Posted your first comment.",
      icon: "✎",
    },
    {
      key: "first_like",
      title: "Admirer",
      description: "Liked your first episode.",
      icon: "♥",
    },
    {
      key: "saga_finisher",
      title: "Saga Finisher",
      description: "Read every episode of a saga.",
      icon: "★",
    },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: {},
      create: a,
    });
  }
  console.log(`Seeded ${achievements.length} achievements.`);

  // ── Sample story ───────────────────────────────────────
  const story = await prisma.story.upsert({
    where: { slug: "rostam-and-sohrab" },
    update: {},
    create: {
      slug: "rostam-and-sohrab",
      title: "Rostam and Sohrab",
      summary:
        "The tragic tale of the mighty hero Rostam and the son he never knew, whose paths cross on the battlefield with devastating consequence.",
      published: true,
    },
  });

  const episodes = [
    {
      slug: "rostam-and-sohrab-1",
      title: "A Night in Samangan",
      excerpt: "Rostam's horse Rakhsh is stolen, leading him to the court of Samangan.",
      orderIndex: 1,
      content:
        "Rostam, the greatest of Persia's champions, rode out from Zabulistan upon his faithful horse Rakhsh, seeking sport along the border with Turan.\n\nWhile Rostam slept beneath the stars, Rakhsh wandered and was captured by riders from the nearby city of Samangan. Waking to find his horse gone, Rostam followed the tracks to the city gates, prepared for war — but the King of Samangan, fearful of Rostam's wrath, welcomed him instead as an honored guest and promised Rakhsh would be found.\n\nThat night, the king's daughter Tahmineh came to Rostam's chamber. She had heard of his legend since childhood and asked to bear his child, that Persia might have another hero in his image. Rostam, moved by her courage, agreed, and before he departed the next day, gave her a jeweled clasp — a token to be given to their child, should it be a son.",
      published: true,
    },
    {
      slug: "rostam-and-sohrab-2",
      title: "The Son Unknown",
      excerpt: "Years later, a young warrior named Sohrab rises in Turan.",
      orderIndex: 2,
      content:
        "Nine months after Rostam's departure, Tahmineh gave birth to a son of extraordinary strength, whom she named Sohrab. She raised him in secret, fearful that if Rostam's enemies learned of his existence, they would move against him.\n\nBy the age of ten, Sohrab could best grown men in wrestling and horsemanship. He begged his mother to reveal his father's name, and when she finally told him he was the son of the great Rostam, Sohrab resolved to gather an army, march on Persia, dethrone its king, and set his father upon the throne in his place — never suspecting the tragedy this ambition would set in motion.",
      published: true,
    },
  ];

  for (const ep of episodes) {
    await prisma.episode.upsert({
      where: { slug: ep.slug },
      update: {},
      create: {
        ...ep,
        storyId: story.id,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`Seeded story "${story.title}" with ${episodes.length} episodes.`);

  console.log("\nSeeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
