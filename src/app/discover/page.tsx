import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Discover — Forge" };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function DiscoverPage() {
  const session = await getOptionalSession();

  const projects = await db.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    take: 60,
    include: { owner: { select: { name: true, username: true } } },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Discover</h1>
          <p className="mt-3 text-lg text-muted">
            Projects the community has built and published with Forge.
          </p>
        </div>

        {projects.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-brand-foreground">
              <Sparkles className="h-6 w-6" />
            </span>
            <CardTitle>Nothing published yet</CardTitle>
            <CardDescription className="max-w-sm">
              Be the first — publish a project from its workspace to show it here.
            </CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex h-full flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between pt-0">
                  {project.owner.username ? (
                    <Link
                      href={`/u/${project.owner.username}`}
                      className="flex items-center gap-2 text-sm text-muted hover:text-foreground"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-hover text-[10px] font-semibold">
                        {initials(project.owner.name) || "U"}
                      </span>
                      {project.owner.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">{project.owner.name}</span>
                  )}
                  <a
                    href={`/p/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                  >
                    View <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
