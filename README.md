# Shahnameh Tales

An episodic storytelling website for retellings of the Shahnameh (the
Persian "Book of Kings"). Readers can browse sagas, read episodes, like and
comment, build a profile with achievements, and support the project via a
donation link. Includes a built-in admin panel for publishing stories and
episodes without touching code.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Server Actions)
- **PostgreSQL** database
- **Prisma** ORM
- **Tailwind CSS 4**
- **JWT + bcrypt** for authentication (no third-party auth service required)
- **Zod** for input validation

Everything runs in one Next.js project — no separate backend server needed.

---

## 1. Prerequisites

- Node.js 20+ (Node 22 recommended)
- A PostgreSQL database. Options:
  - Install PostgreSQL locally ([postgresql.org/download](https://www.postgresql.org/download/))
  - Or use a free hosted database: [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app) all have free tiers and give you a `DATABASE_URL` connection string instantly.

## 2. Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
# Edit the .env file (already created) and set:
#   DATABASE_URL      -> your PostgreSQL connection string
#   JWT_SECRET         -> a long random string (generate with: openssl rand -base64 32)
#   NEXT_PUBLIC_SITE_URL -> http://localhost:3000 for local dev

# 3. Generate the Prisma client
npx prisma generate

# 4. Create the database tables
npx prisma migrate dev --name init

# 5. (Optional but recommended) Seed sample data
#    Creates an admin account (username: admin / password: ChangeMe123!)
#    plus one sample story with two episodes and starter achievements.
npm run db:seed

# 6. Start the dev server
npm run dev
```

Visit `http://localhost:3000`. Log in at `/login` with the seeded admin
account, then go to `/admin` to manage stories and episodes.

**Change the admin password immediately** — either through a future
"change password" feature you add, directly in the database, or by editing
`prisma/seed.ts` before re-seeding a fresh database.

## 3. Project structure

```
app/
  actions/          Server Actions (auth, comments, likes, admin CRUD, contact)
  admin/             Admin panel (protected, ADMIN role only)
  episodes/[slug]/   Episode reading page (likes, comments, prev/next nav)
  stories/           Story listing + individual story pages
  profile/           Public profile + edit profile
  login/ register/   Auth pages
  about/ contact/ donate/   Static/basic pages
  layout.tsx         Root layout (navbar, footer, fonts)
  page.tsx           Home page

components/          Shared React components
components/admin/    Admin-only form components

lib/
  prisma.ts          Prisma client singleton
  auth.ts            Password hashing, JWT signing/verification, session cookies
  validation.ts       Zod schemas for all form input
  data.ts            Centralized database queries

prisma/
  schema.prisma      Full data model
  seed.ts            Sample data script
```

## 4. Data model overview

- **User** — username/email/password (hashed), role (`READER` or `ADMIN`), profile fields, avatar
- **Story** — a saga (e.g. "Rostam and Sohrab")
- **Episode** — a chapter within a Story, ordered by `orderIndex`
- **Like** — one per user per episode
- **Comment** — supports one level of threaded replies via `parentId`
- **Achievement** / **UserAchievement** — achievement definitions and which users have unlocked them. The schema is ready now; you decide later *when* achievements are granted (e.g. in the like/comment Server Actions) and seed the `Achievement` rows you want.
- **ReadingProgress** — tracks which episodes a user has read (foundation for "continue reading" and read-based achievements)
- **SiteSetting** — key/value store; currently used for the donate link so you can change it from `/admin/settings` without redeploying
- **ContactMessage** — stores submissions from the Contact page

## 5. Admin panel

Visit `/admin` (requires an account with `ADMIN` role — the seed script
creates one). From there you can:

- Create, edit, publish/unpublish, and delete stories
- Create, edit, publish/unpublish, and delete episodes within a story
- Set the donation link shown on `/donate`

To promote an existing user to admin manually, run:

```bash
npx prisma studio
```

This opens a browser-based database editor where you can change a user's
`role` field to `ADMIN`.

## 6. Deploying

When you're ready to make the site public:

1. **Database**: create a production Postgres database (Supabase, Neon, or Railway all work well and have generous free tiers).
2. **Hosting**: [Vercel](https://vercel.com) is the simplest option for a Next.js app — connect your GitHub repo and it deploys automatically.
3. Set the same environment variables (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`) in your hosting provider's dashboard. Use a **different, strong** `JWT_SECRET` in production than the placeholder in `.env`.
4. Run `npx prisma migrate deploy` against the production database (most hosts let you run this as a build step or one-off command).
5. Seed an admin account for production (edit the password in `prisma/seed.ts` first, or create the admin manually via Prisma Studio).

## 7. Ideas for future features

The schema was designed with these in mind, so most can be added without a
major rework:

- Achievement-granting logic (e.g. award "First Words" the first time a user comments) — hook into the existing Server Actions in `app/actions/interactions.ts`
- "Continue reading" section on the profile page using `ReadingProgress`
- Search across stories/episodes
- Rich text / markdown rendering for episode content (currently plain paragraphs split on blank lines — swap in a markdown renderer like `react-markdown` if you want bold, links, etc. in episodes)
- Email verification or password reset (would need an email-sending service)
- Reviewing contact messages from an admin page (the data is already being saved to `ContactMessage`)
- Pagination for stories/episodes once you have many
