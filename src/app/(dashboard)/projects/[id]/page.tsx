import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Rocket } from "lucide-react";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectChat } from "@/components/workspace/project-chat";

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
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!project) {
    notFound();
  }

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
        <Button variant="secondary" disabled className="hidden sm:inline-flex">
          <Rocket className="h-4 w-4" />
          Deploy (soon)
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col overflow-hidden border-r border-border">
          <ProjectChat
            projectId={project.id}
            initialMessages={project.messages.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            }))}
          />
        </div>
        <aside className="hidden flex-col gap-4 overflow-y-auto p-6 lg:flex">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Project plan</h2>
            <p className="mt-1 text-sm text-muted">
              As you chat with the AI architect, the plan for {project.name} will take shape here.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
            Live preview, code generation, and one-click deployment are coming in the next build
            phase.
          </div>
        </aside>
      </div>
    </div>
  );
}
