import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { regenerateProjectFiles } from "@/lib/files";
import { isAiConfigured } from "@/lib/ai";

async function assertOwnership(projectId: string, userId: string) {
  return db.project.findFirst({ where: { id: projectId, ownerId: userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id: projectId } = await params;

  const project = await assertOwnership(projectId, userId);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const files = await db.projectFile.findMany({ where: { projectId }, orderBy: { path: "asc" } });
  return NextResponse.json({ files });
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
      { error: "AI responses aren't enabled yet. Add an ANTHROPIC_API_KEY to generate code." },
      { status: 422 }
    );
  }

  const plan = await db.projectPlan.findUnique({ where: { projectId } });
  if (!plan) {
    return NextResponse.json(
      { error: "Generate a project plan first — code generation builds from the plan." },
      { status: 422 }
    );
  }

  const files = await regenerateProjectFiles(projectId);
  if (!files) {
    return NextResponse.json({ error: "Couldn't generate code. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ files });
}
