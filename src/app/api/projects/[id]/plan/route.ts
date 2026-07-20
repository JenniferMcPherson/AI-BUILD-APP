import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { regenerateProjectPlan } from "@/lib/plan";
import { isAiConfigured } from "@/lib/ai";

async function assertOwnership(projectId: string, userId: string) {
  const project = await db.project.findFirst({ where: { id: projectId, ownerId: userId } });
  return project;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id: projectId } = await params;

  const project = await assertOwnership(projectId, userId);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const plan = await db.projectPlan.findUnique({ where: { projectId } });
  return NextResponse.json({ plan });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id: projectId } = await params;

  const project = await assertOwnership(projectId, userId);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI responses aren't enabled yet. Add an ANTHROPIC_API_KEY to generate a plan." },
      { status: 422 }
    );
  }

  const messageCount = await db.message.count({ where: { projectId } });
  if (messageCount === 0) {
    return NextResponse.json(
      { error: "Send at least one message before generating a plan." },
      { status: 422 }
    );
  }

  const plan = await regenerateProjectPlan(projectId);
  return NextResponse.json({ plan });
}
