import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(24, "Username must be at most 24 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter your password"),
});

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment is too long (max 2000 characters)"),
  episodeId: z.string().min(1),
  parentId: z.string().optional(),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const storySchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  summary: z.string().min(1).max(1000),
  coverImage: z.string().url().optional().or(z.literal("")),
  published: z.boolean().optional(),
});

export const episodeSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  orderIndex: z.number().int().positive(),
  storyId: z.string().min(1),
  published: z.boolean().optional(),
});

export const glossaryTermSchema = z.object({
  // The [[term]] key as it will appear in episode markup, e.g. "Rostam".
  // Normalized to lowercase+trimmed before matching, so the admin can type
  // it with normal casing.
  term: z
    .string()
    .min(1, "Term is required")
    .max(100, "Term is too long")
    .regex(
      /^[a-zA-Z0-9 '’-]+$/,
      "Term can only contain letters, numbers, spaces, hyphens, and apostrophes"
    ),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  definition: z
    .string()
    .min(1, "Definition is required")
    .max(1000, "Definition is too long (max 1000 characters)"),
  type: z.enum(["CHARACTER", "PLACE", "TERM"]).default("TERM"),
});
