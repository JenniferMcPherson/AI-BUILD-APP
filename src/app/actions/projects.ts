"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { slugify, withUniqueSuffix } from "@/lib/slug";
import { CreateProjectSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/stripe";

export type CreateProjectState =
  | {
      errors?: { name?: string[]; description?: string[] };
      message?: string;
    }
  | undefined;

export async function createProject(
  _state: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const { userId } = await verifySession();

  const validatedFields = CreateProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const limit = PLAN_LIMITS[user.planTier];
  if (limit !== null) {
    const projectCount = await db.project.count({ where: { ownerId: userId } });
    if (projectCount >= limit) {
      return {
        message: `You've reached the ${limit}-project limit on the ${user.planTier.toLowerCase()} plan. Upgrade to create more.`,
      };
    }
  }

  const { name, description } = validatedFields.data;
  const slug = withUniqueSuffix(slugify(name));

  const project = await db.project.create({
    data: {
      name,
      description,
      slug,
      ownerId: userId,
      status: "PLANNING",
      messages: description
        ? {
            create: {
              role: "USER",
              content: description,
            },
          }
        : undefined,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/projects/${project.id}`);
}

export async function deleteProject(projectId: string) {
  const { userId } = await verifySession();

  await db.project.deleteMany({
    where: { id: projectId, ownerId: userId },
  });

  revalidatePath("/dashboard");
}

export async function publishProject(projectId: string) {
  const { userId } = await verifySession();

  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: userId },
    include: { _count: { select: { files: true } } },
  });

  if (!project) return { error: "Project not found." };
  if (project._count.files === 0) {
    return { error: "Generate code before publishing." };
  }

  await db.project.update({ where: { id: projectId }, data: { status: "PUBLISHED" } });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}

export async function unpublishProject(projectId: string) {
  const { userId } = await verifySession();

  const project = await db.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) return { error: "Project not found." };

  await db.project.update({ where: { id: projectId }, data: { status: "READY" } });
  revalidatePath(`/projects/${projectId}`);
  return { ok: true };
}
