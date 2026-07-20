"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { generateInviteCode, MAX_INVITES_PER_USER } from "@/lib/invite";

export async function createInviteCode() {
  const { userId } = await verifySession();

  const existingCount = await db.inviteCode.count({ where: { createdByUserId: userId } });
  if (existingCount >= MAX_INVITES_PER_USER) {
    return { error: `You can create up to ${MAX_INVITES_PER_USER} invites.` };
  }

  let code = generateInviteCode();
  for (let attempts = 0; attempts < 5; attempts++) {
    const existing = await db.inviteCode.findUnique({ where: { code } });
    if (!existing) break;
    code = generateInviteCode();
  }

  const created = await db.inviteCode.create({ data: { code, createdByUserId: userId } });
  revalidatePath("/settings");
  return { ok: true, id: created.id, code: created.code };
}
