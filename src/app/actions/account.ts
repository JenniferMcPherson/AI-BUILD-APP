"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { deleteSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ChangePasswordSchema, UpdateProfileSchema } from "@/lib/validations";

export type UpdateProfileState =
  | { errors?: { name?: string[] }; message?: string; success?: boolean }
  | undefined;

export async function updateProfile(
  _state: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const { userId } = await verifySession();

  const validatedFields = UpdateProfileSchema.safeParse({ name: formData.get("name") });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  await db.user.update({ where: { id: userId }, data: { name: validatedFields.data.name } });
  revalidatePath("/settings");
  return { success: true };
}

export type ChangePasswordState =
  | {
      errors?: { currentPassword?: string[]; newPassword?: string[] };
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function changePassword(
  _state: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const { userId } = await verifySession();

  const validatedFields = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.passwordHash) {
    return { message: "This account doesn't use a password." };
  }

  const isValid = await verifyPassword(validatedFields.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return { errors: { currentPassword: ["Current password is incorrect."] } };
  }

  const newHash = await hashPassword(validatedFields.data.newPassword);
  await db.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
  return { success: true };
}

export async function deleteAccount() {
  const { userId } = await verifySession();
  await db.user.delete({ where: { id: userId } });
  await deleteSession();
  redirect("/");
}
