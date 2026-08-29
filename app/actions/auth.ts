"use server";

import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  signToken,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validation";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return {
      success: false,
      error:
        existing.username === username
          ? "That username is already taken"
          : "An account with that email already exists",
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      displayName: username,
    },
  });

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });
  await setSessionCookie(token);

  return { success: true };
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const { identifier, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  // Use the same generic error whether the user doesn't exist or the
  // password is wrong, so we don't leak which usernames/emails exist.
  const genericError = "Incorrect username/email or password";

  if (!user) {
    return { success: false, error: genericError };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: genericError };
  }

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });
  await setSessionCookie(token);

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
}
