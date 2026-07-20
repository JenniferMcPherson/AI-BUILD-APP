import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";

const CONTENT_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  json: "application/json; charset=utf-8",
};

function contentTypeFor(path: string) {
  const ext = path.split(".").pop() ?? "";
  return CONTENT_TYPES[ext] ?? "text/plain; charset=utf-8";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; path?: string[] }> }
) {
  const { userId } = await verifySession();
  const { id: projectId, path } = await params;

  const project = await db.project.findFirst({ where: { id: projectId, ownerId: userId } });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const filePath = path && path.length > 0 ? path.join("/") : "index.html";

  const file = await db.projectFile.findUnique({
    where: { projectId_path: { projectId, path: filePath } },
  });

  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(file.content, {
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "no-store",
    },
  });
}
