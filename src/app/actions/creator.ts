"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { CreatorProfileSchema } from "@/lib/validations";

export type CreatorProfileState =
  | {
      errors?: {
        location?: string[];
        tagline?: string[];
        story?: string[];
        buildProcess?: string[];
      };
      success?: boolean;
    }
  | undefined;

export async function updateCreatorProfile(
  _state: CreatorProfileState,
  formData: FormData
): Promise<CreatorProfileState> {
  const { userId } = await verifySession();

  const validatedFields = CreatorProfileSchema.safeParse({
    location: formData.get("location") || undefined,
    tagline: formData.get("tagline") || undefined,
    story: formData.get("story") || undefined,
    buildProcess: formData.get("buildProcess") || undefined,
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { location, tagline, story, buildProcess } = validatedFields.data;

  const user = await db.user.update({
    where: { id: userId },
    data: {
      location: location || null,
      tagline: tagline || null,
      story: story || null,
      buildProcess: buildProcess || null,
    },
    select: { username: true },
  });

  revalidatePath("/dashboard/creator");
  if (user.username) revalidatePath(`/u/${user.username}`);
  return { success: true };
}
