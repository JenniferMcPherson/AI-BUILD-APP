import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { slugify } from "@/lib/slug";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id: projectId } = await params;

  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: userId },
    include: { files: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (project.files.length === 0) {
    return NextResponse.json({ error: "This project has no generated code yet." }, { status: 422 });
  }

  const zip = new JSZip();
  for (const file of project.files) {
    zip.file(file.path, file.content);
  }
  zip.file(
    "README.md",
    `# ${project.name}\n\n${project.description ?? ""}\n\nExported from Forge. Open index.html in a browser to run it.\n`
  );

  const buffer = await zip.generateAsync({ type: "uint8array" });
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const filename = `${slugify(project.name) || "project"}.zip`;

  return new NextResponse(arrayBuffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
