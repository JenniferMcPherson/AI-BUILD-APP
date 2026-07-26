"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { CreatorMessageSchema } from "@/lib/validations";

export type CreatorMessageState = { error?: string; success?: boolean } | undefined;

export async function sendCreatorMessage(
  projectSlug: string,
  _state: CreatorMessageState,
  formData: FormData
): Promise<CreatorMessageState> {
  const { userId } = await verifySession();

  const validatedFields = CreatorMessageSchema.safeParse({ body: formData.get("body") });
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message ?? "Invalid message." };
  }

  const project = await db.project.findFirst({
    where: { slug: projectSlug, listedInMarketplace: true },
    select: { id: true, ownerId: true },
  });
  if (!project) return { error: "Listing not found." };
  if (project.ownerId === userId) return { error: "You can't message yourself about your own listing." };

  await db.creatorMessage.create({
    data: {
      projectId: project.id,
      senderId: userId,
      recipientId: project.ownerId,
      body: validatedFields.data.body,
    },
  });

  revalidatePath("/dashboard/creator/messages");
  return { success: true };
}

export async function markThreadRead(projectId: string, otherUserId: string) {
  const { userId } = await verifySession();

  await db.creatorMessage.updateMany({
    where: {
      projectId,
      recipientId: userId,
      senderId: otherUserId,
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/creator/messages");
}
