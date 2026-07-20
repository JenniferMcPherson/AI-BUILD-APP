import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { db } from "@/lib/db";
import { withBaseHref } from "@/lib/html";

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
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  const { slug, path } = await params;

  const project = await db.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  });

  if (!project) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path && path.length > 0 ? path.join("/") : "index.html";

  const file = await db.projectFile.findUnique({
    where: { projectId_path: { projectId: project.id, path: filePath } },
  });

  if (!file) {
    return new NextResponse("Not found", { status: 404 });
  }

  const content = filePath.endsWith(".html")
    ? withBaseHref(file.content, `/p/${slug}/`)
    : file.content;

  if (filePath === "index.html") {
    after(async () => {
      await db.project.update({ where: { id: project.id }, data: { viewCount: { increment: 1 } } });
    });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "public, max-age=60",
    },
  });
}
