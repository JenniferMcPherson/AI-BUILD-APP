"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { slugify, withUniqueSuffix } from "@/lib/slug";
import { ListMarketplaceSchema, ReviewSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/stripe";

export type ListMarketplaceState = { error?: string; success?: boolean; category?: string } | undefined;

export async function listInMarketplace(
  projectId: string,
  _state: ListMarketplaceState,
  formData: FormData
): Promise<ListMarketplaceState> {
  const { userId } = await verifySession();

  const validatedFields = ListMarketplaceSchema.safeParse({ category: formData.get("category") });
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message ?? "Choose a category." };
  }

  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: userId },
    include: { _count: { select: { files: true } } },
  });
  if (!project) return { error: "Project not found." };
  if (project._count.files === 0) return { error: "Generate code before listing it." };
  if (project.status !== "PUBLISHED") {
    return { error: "Publish the project (hosted URL) before listing it in the marketplace." };
  }

  await db.project.update({
    where: { id: projectId },
    data: { listedInMarketplace: true, category: validatedFields.data.category },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/marketplace");
  return { success: true, category: validatedFields.data.category };
}

export async function unlistFromMarketplace(projectId: string) {
  const { userId } = await verifySession();

  await db.project.updateMany({
    where: { id: projectId, ownerId: userId },
    data: { listedInMarketplace: false },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/marketplace");
}

export type ReviewState = { errors?: { rating?: string[]; comment?: string[] }; error?: string } | undefined;

export async function submitReview(
  projectSlug: string,
  _state: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const { userId } = await verifySession();

  const validatedFields = ReviewSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment") || undefined,
  });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const project = await db.project.findFirst({
    where: { slug: projectSlug, listedInMarketplace: true },
    select: { id: true, ownerId: true },
  });
  if (!project) return { error: "Listing not found." };
  if (project.ownerId === userId) return { error: "You can't review your own listing." };

  await db.review.upsert({
    where: { projectId_userId: { projectId: project.id, userId } },
    create: {
      projectId: project.id,
      userId,
      rating: validatedFields.data.rating,
      comment: validatedFields.data.comment,
    },
    update: { rating: validatedFields.data.rating, comment: validatedFields.data.comment },
  });

  revalidatePath(`/marketplace/${projectSlug}`);
  return undefined;
}

export async function cloneProjectAsTemplate(projectSlug: string) {
  const { userId } = await verifySession();

  const source = await db.project.findFirst({
    where: { slug: projectSlug, listedInMarketplace: true },
    include: { plan: true, files: true },
  });
  if (!source) return { error: "Listing not found." };

  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const limit = PLAN_LIMITS[user.planTier];
  if (limit !== null) {
    const projectCount = await db.project.count({ where: { ownerId: userId } });
    if (projectCount >= limit) {
      return {
        error: `You've reached the ${limit}-project limit on the ${user.planTier.toLowerCase()} plan. Upgrade to clone more.`,
      };
    }
  }

  const slug = withUniqueSuffix(slugify(source.name));

  const cloned = await db.project.create({
    data: {
      name: source.name,
      description: source.description,
      slug,
      ownerId: userId,
      status: "READY",
      plan: source.plan
        ? {
            create: {
              summary: source.plan.summary,
              features: source.plan.features as Prisma.InputJsonValue,
              dataModel: source.plan.dataModel as Prisma.InputJsonValue,
              buildSteps: source.plan.buildSteps as Prisma.InputJsonValue,
            },
          }
        : undefined,
      files: {
        create: source.files.map((f) => ({ path: f.path, content: f.content })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/projects/${cloned.id}`);
}
