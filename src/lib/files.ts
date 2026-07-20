import "server-only";

import { db } from "@/lib/db";
import { generateProjectFiles } from "@/lib/ai";

export async function regenerateProjectFiles(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { plan: true },
  });

  if (!project?.plan) return null;

  const planData = {
    summary: project.plan.summary,
    features: project.plan.features as { title: string; description: string }[],
    dataModel: project.plan.dataModel as {
      name: string;
      fields: { name: string; type: string; description?: string }[];
    }[],
    buildSteps: project.plan.buildSteps as string[],
  };

  const files = await generateProjectFiles(planData, project.name);
  if (!files || files.length === 0) return null;

  const lastVersion = await db.projectVersion.findFirst({
    where: { projectId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextVersion = (lastVersion?.number ?? 0) + 1;

  await db.$transaction([
    db.projectFile.deleteMany({ where: { projectId } }),
    db.projectFile.createMany({
      data: files.map((f) => ({ projectId, path: f.path, content: f.content })),
    }),
    db.projectVersion.create({
      data: { projectId, number: nextVersion, files },
    }),
    db.project.update({ where: { id: projectId }, data: { status: "READY" } }),
  ]);

  return db.projectFile.findMany({ where: { projectId }, orderBy: { path: "asc" } });
}

export async function restoreProjectVersion(projectId: string, versionId: string) {
  const version = await db.projectVersion.findFirst({
    where: { id: versionId, projectId },
  });
  if (!version) return null;

  const files = version.files as { path: string; content: string }[];

  await db.$transaction([
    db.projectFile.deleteMany({ where: { projectId } }),
    db.projectFile.createMany({
      data: files.map((f) => ({ projectId, path: f.path, content: f.content })),
    }),
  ]);

  return db.projectFile.findMany({ where: { projectId }, orderBy: { path: "asc" } });
}
