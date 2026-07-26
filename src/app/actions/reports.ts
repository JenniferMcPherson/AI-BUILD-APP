"use server";

import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { ReportSchema } from "@/lib/validations";

export type ReportState = { error?: string; success?: boolean } | undefined;

export async function reportCreator(
  targetUserId: string,
  _state: ReportState,
  formData: FormData
): Promise<ReportState> {
  const { userId } = await verifySession();
  if (userId === targetUserId) return { error: "You can't report yourself." };

  const validatedFields = ReportSchema.safeParse({
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  });
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message ?? "Choose a reason." };
  }

  await db.report.create({
    data: {
      reporterId: userId,
      targetType: "CREATOR",
      targetUserId,
      reason: validatedFields.data.reason,
      details: validatedFields.data.details || null,
    },
  });

  return { success: true };
}

export async function reportProject(
  targetProjectId: string,
  _state: ReportState,
  formData: FormData
): Promise<ReportState> {
  const { userId } = await verifySession();

  const project = await db.project.findUnique({
    where: { id: targetProjectId },
    select: { ownerId: true },
  });
  if (!project) return { error: "Listing not found." };
  if (project.ownerId === userId) return { error: "You can't report your own listing." };

  const validatedFields = ReportSchema.safeParse({
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  });
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message ?? "Choose a reason." };
  }

  await db.report.create({
    data: {
      reporterId: userId,
      targetType: "PROJECT",
      targetProjectId,
      reason: validatedFields.data.reason,
      details: validatedFields.data.details || null,
    },
  });

  return { success: true };
}
