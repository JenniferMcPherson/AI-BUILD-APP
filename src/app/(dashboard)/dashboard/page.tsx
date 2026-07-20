import Link from "next/link";
import { Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PLANNING: "Planning",
  BUILDING: "Building",
  READY: "Ready",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export default async function DashboardPage() {
  const { userId } = await verifySession();

  const projects = await db.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your projects</h1>
          <p className="text-sm text-muted">
            Everything you&apos;re building, in one place.
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 border-dashed py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-brand-foreground">
            <Sparkles className="h-6 w-6" />
          </span>
          <CardTitle>Nothing here yet</CardTitle>
          <CardDescription className="max-w-sm">
            Create your first project and describe what you want to build. The AI builder will take it
            from there.
          </CardDescription>
          <div className="mt-2">
            <NewProjectDialog />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-colors hover:bg-surface-hover">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {statusLabel[project.status] ?? project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted">
                    Updated {project.updatedAt.toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
