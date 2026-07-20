import "server-only";

import { db } from "@/lib/db";
import { generateProjectPlan } from "@/lib/ai";

export async function regenerateProjectPlan(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!project) return null;

  const history = project.messages
    .filter((m) => m.role !== "SYSTEM")
    .map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

  const plan = await generateProjectPlan(history, project.name);
  if (!plan) return null;

  return db.projectPlan.upsert({
    where: { projectId },
    create: {
      projectId,
      summary: plan.summary,
      features: plan.features,
      dataModel: plan.dataModel,
      buildSteps: plan.buildSteps,
    },
    update: {
      summary: plan.summary,
      features: plan.features,
      dataModel: plan.dataModel,
      buildSteps: plan.buildSteps,
    },
  });
}
