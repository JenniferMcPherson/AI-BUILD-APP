import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { ExportMenu } from "@/components/workspace/export-menu";
import type { PlanData } from "@/components/workspace/project-plan-panel";

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  BUILDING: "Building",
  READY: "Ready",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await verifySession();
  const { id } = await params;

  const project = await db.project.findFirst({
    where: { id, ownerId: userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      plan: true,
      files: { orderBy: { path: "asc" } },
    },
  });

  if (!project) {
    notFound();
  }

  const collections = await db.collection.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">{project.name}</h1>
              <Badge variant="secondary">{statusLabel[project.status] ?? project.status}</Badge>
            </div>
            {project.description && (
              <p className="line-clamp-1 text-sm text-muted">{project.description}</p>
            )}
          </div>
        </div>
        <ExportMenu
          projectId={project.id}
          projectSlug={project.slug}
          initialStatus={project.status}
          hasFiles={project.files.length > 0}
          initialListed={project.listedInMarketplace}
          initialCategory={project.category}
          collections={collections}
          initialCollectionId={project.collectionId}
        />
      </div>

      <WorkspaceShell
        projectId={project.id}
        projectName={project.name}
        initialMessages={project.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))}
        initialPlan={project.plan as PlanData}
        initialFiles={project.files.map((f) => ({ path: f.path, content: f.content }))}
      />
    </div>
  );
}
