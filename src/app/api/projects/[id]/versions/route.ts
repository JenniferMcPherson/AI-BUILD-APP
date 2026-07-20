import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id: projectId } = await params;

  const project = await db.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const versions = await db.projectVersion.findMany({
    where: { projectId },
    orderBy: { number: "desc" },
    select: { id: true, number: true, createdAt: true },
  });

  return NextResponse.json({ versions });
}
