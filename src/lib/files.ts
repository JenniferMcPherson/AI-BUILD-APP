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

  await db.$transaction([
    db.projectFile.deleteMany({ where: { projectId } }),
    db.projectFile.createMany({
      data: files.map((f) => ({ projectId, path: f.path, content: f.content })),
    }),
    db.project.update({ where: { id: projectId }, data: { status: "READY" } }),
  ]);

  return db.projectFile.findMany({ where: { projectId }, orderBy: { path: "asc" } });
}
