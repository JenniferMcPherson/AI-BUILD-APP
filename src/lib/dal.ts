import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { decryptSession, getSessionCookie } from "@/lib/session";

export const verifySession = cache(async () => {
  const token = await getSessionCookie();
  const session = await decryptSession(token);

  if (!session || session.expiresAt < Date.now()) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.userId };
});

/** Optimistic read that never redirects — use for layouts that render for both signed-in and anonymous users. */
export const getOptionalSession = cache(async () => {
  const token = await getSessionCookie();
  const session = await decryptSession(token);
  if (!session || session.expiresAt < Date.now()) return null;
  return { userId: session.userId };
});

export const getCurrentUser = cache(async () => {
  const session = await getOptionalSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      planTier: true,
      createdAt: true,
    },
  });

  return user;
});
