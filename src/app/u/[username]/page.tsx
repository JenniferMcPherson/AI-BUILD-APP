import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return { title: `${username} — Forge` };
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await getOptionalSession();

  const user = await db.user.findUnique({
    where: { username },
    select: {
      name: true,
      username: true,
      bio: true,
      createdAt: true,
      projects: {
        where: { status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, description: true, slug: true },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="mb-10 flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full brand-gradient text-xl font-semibold text-brand-foreground">
            {initials(user.name) || "U"}
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
            <p className="text-sm text-muted">@{user.username}</p>
            {user.bio && <p className="mt-2 max-w-xl text-sm text-foreground">{user.bio}</p>}
            <p className="mt-2 text-xs text-muted">
              Building since {user.createdAt.toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
          Published projects
        </h2>

        {user.projects.length === 0 ? (
          <Card className="border-dashed py-12 text-center">
            <CardDescription>Nothing published yet.</CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {user.projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description yet."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <a
                    href={`/p/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-1 text-sm font-medium text-brand hover:underline"
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
