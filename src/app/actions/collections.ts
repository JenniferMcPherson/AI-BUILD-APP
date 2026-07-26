"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { slugify } from "@/lib/slug";
import { CollectionSchema } from "@/lib/validations";

export type CollectionState =
  | { errors?: { title?: string[]; description?: string[] }; success?: boolean }
  | undefined;

async function uniqueSlugForOwner(ownerId: string, title: string) {
  const base = slugify(title) || "collection";
  let slug = base;
  let attempt = 1;
  while (await db.collection.findUnique({ where: { ownerId_slug: { ownerId, slug } } })) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

export async function createCollection(
  _state: CollectionState,
  formData: FormData
): Promise<CollectionState> {
  const { userId } = await verifySession();

  const validatedFields = CollectionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { title, description } = validatedFields.data;
  const slug = await uniqueSlugForOwner(userId, title);

  await db.collection.create({
    data: { ownerId: userId, title, slug, description: description || null },
  });

  revalidatePath("/dashboard/creator/collections");
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (user?.username) revalidatePath(`/u/${user.username}`);
  return { success: true };
}

export async function updateCollection(collectionId: string, formData: FormData) {
  const { userId } = await verifySession();

  const validatedFields = CollectionSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message ?? "Invalid input." };
  }

  const { title, description } = validatedFields.data;

  const result = await db.collection.updateMany({
    where: { id: collectionId, ownerId: userId },
    data: { title, description: description || null },
  });
  if (result.count === 0) return { error: "Collection not found." };

  revalidatePath("/dashboard/creator/collections");
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (user?.username) revalidatePath(`/u/${user.username}`);
  return { success: true };
}

export async function deleteCollection(collectionId: string) {
  const { userId } = await verifySession();

  await db.collection.deleteMany({ where: { id: collectionId, ownerId: userId } });

  revalidatePath("/dashboard/creator/collections");
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (user?.username) revalidatePath(`/u/${user.username}`);
}

export async function assignProjectToCollection(projectId: string, collectionId: string | null) {
  const { userId } = await verifySession();

  if (collectionId) {
    const collection = await db.collection.findFirst({ where: { id: collectionId, ownerId: userId } });
    if (!collection) return { error: "Collection not found." };
  }

  const result = await db.project.updateMany({
    where: { id: projectId, ownerId: userId },
    data: { collectionId },
  });
  if (result.count === 0) return { error: "Project not found." };

  revalidatePath(`/projects/${projectId}`);
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } });
  if (user?.username) revalidatePath(`/u/${user.username}`);
  return { success: true };
}
