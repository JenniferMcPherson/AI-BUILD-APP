import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import * as z from "zod";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { generateBuilderReply } from "@/lib/ai";
import { regenerateProjectPlan } from "@/lib/plan";

const BodySchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id: projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const history = await db.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const userMessage = await db.message.create({
    data: { projectId, role: "USER", content: parsed.data.content },
  });

  const conversation = [...history, userMessage]
    .filter((m) => m.role !== "SYSTEM")
    .map((m) => ({
      role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
      content: m.content,
    }));

  let replyContent: string;
  try {
    replyContent = await generateBuilderReply(conversation, project.name);
  } catch {
    replyContent =
      "Something went wrong reaching the AI architect. Please try sending your message again.";
  }

  const assistantMessage = await db.message.create({
    data: { projectId, role: "ASSISTANT", content: replyContent },
  });

  await db.project.update({
    where: { id: projectId },
    data: { status: project.status === "DRAFT" ? "PLANNING" : project.status },
  });

  after(async () => {
    try {
      await regenerateProjectPlan(projectId);
    } catch (error) {
      console.error(`Failed to regenerate plan for project ${projectId}:`, error);
    }
  });

  return NextResponse.json({ userMessage, assistantMessage });
}
