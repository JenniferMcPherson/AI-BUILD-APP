import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { restoreProjectVersion } from "@/lib/files";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const { userId } = await verifySession();
  const { id: projectId, versionId } = await params;

  const project = await db.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const files = await restoreProjectVersion(projectId, versionId);
  if (!files) {
    return NextResponse.json({ error: "Version not found." }, { status: 404 });
  }

  return NextResponse.json({ files });
}
