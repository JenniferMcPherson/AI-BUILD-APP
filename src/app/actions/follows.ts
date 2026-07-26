"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export async function followCreator(creatorId: string, username: string) {
  const { userId } = await verifySession();
  if (userId === creatorId) return { error: "You can't follow yourself." };

  await db.follow.upsert({
    where: { followerId_creatorId: { followerId: userId, creatorId } },
    create: { followerId: userId, creatorId },
    update: {},
  });

  revalidatePath(`/u/${username}`);
  revalidatePath("/dashboard/following");
  return { following: true };
}

export async function unfollowCreator(creatorId: string, username: string) {
  const { userId } = await verifySession();

  await db.follow.deleteMany({ where: { followerId: userId, creatorId } });

  revalidatePath(`/u/${username}`);
  revalidatePath("/dashboard/following");
  return { following: false };
}
