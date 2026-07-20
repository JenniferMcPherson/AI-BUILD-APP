import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { slugify } from "@/lib/slug";
import { createGithubRepo, isGithubConfigured, pushFileToGithub } from "@/lib/github";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await verifySession();
  const { id: projectId } = await params;

  if (!isGithubConfigured()) {
    return NextResponse.json(
      { error: "GitHub export isn't configured yet. Ask an admin to set it up." },
      { status: 501 }
    );
  }

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

  const account = await db.account.findFirst({ where: { userId, provider: "github" } });
  if (!account?.accessToken) {
    return NextResponse.json({ error: "Connect your GitHub account first." }, { status: 422 });
  }

  const repoName = slugify(project.name) || `forge-project-${project.id.slice(-6)}`;
  const repo = await createGithubRepo(account.accessToken, repoName, project.description ?? "");

  if ("error" in repo) {
    return NextResponse.json({ error: repo.error }, { status: 502 });
  }

  for (const file of project.files) {
    await pushFileToGithub(
      account.accessToken,
      repo.full_name,
      file.path,
      file.content,
      `Add ${file.path}`
    );
  }

  return NextResponse.json({ url: repo.html_url });
}
