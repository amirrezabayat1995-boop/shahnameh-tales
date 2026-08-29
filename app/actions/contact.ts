"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  success: boolean;
  error?: string;
}

const contactSchema = z.object({
  name: z.string().min(1, "Enter your name").max(100),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(1, "Enter a message").max(3000),
});

export async function submitContactAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  await prisma.contactMessage.create({ data: parsed.data });

  return { success: true };
}
