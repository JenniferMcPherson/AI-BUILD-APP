"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { slugify, withUniqueSuffix } from "@/lib/slug";
import {
  LoginFormSchema,
  LoginFormState,
  SignupFormSchema,
  SignupFormState,
} from "@/lib/validations";

export async function signup(
  _state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { message: "An account with this email already exists." };
  }

  const inviteOnly = process.env.INVITE_ONLY === "true";
  const rawInviteCode = formData.get("inviteCode");
  const inviteCode = typeof rawInviteCode === "string" ? rawInviteCode.trim().toUpperCase() : "";

  if (inviteOnly && !inviteCode) {
    return { message: "An invite code is required to sign up right now." };
  }

  let invite = null;
  if (inviteCode) {
    invite = await db.inviteCode.findFirst({ where: { code: inviteCode, usedByUserId: null } });
    if (!invite) {
      return { message: "That invite code is invalid or has already been used." };
    }
  }

  const passwordHash = await hashPassword(password);
  const username = withUniqueSuffix(slugify(name));

  const user = await db.user.create({
    data: { name, email, passwordHash, username, isFoundingMember: Boolean(invite) },
    select: { id: true },
  });

  if (invite) {
    await db.inviteCode.update({
      where: { id: invite.id },
      data: { usedByUserId: user.id, usedAt: new Date() },
    });
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    return { message: "Invalid email or password." };
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return { message: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
