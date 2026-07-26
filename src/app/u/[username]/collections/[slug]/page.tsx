import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const owner = await db.user.findUnique({ where: { username }, select: { id: true } });
  const collection = owner
    ? await db.collection.findUnique({
        where: { ownerId_slug: { ownerId: owner.id, slug } },
        select: { title: true, description: true },
      })
    : null;
  if (!collection) return { title: `Collection — Forge` };
  return {
    title: `${collection.title} by @${username} — Forge`,
    description: collection.description ?? undefined,
  };
}

export default async function CreatorCollectionPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const session = await getOptionalSession();

  const owner = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true },
  });
  if (!owner) notFound();

  const collection = await db.collection.findUnique({
    where: { ownerId_slug: { ownerId: owner.id, slug } },
    select: {
      id: true,
      title: true,
      description: true,
      projects: {
        where: { status: "PUBLISHED", listedInMarketplace: true },
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, description: true, slug: true },
      },
    },
  });
  if (!collection) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <Link
          href={`/u/${owner.username}`}
          className="mb-6 flex w-fit items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {owner.name}
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">{collection.title}</h1>
        {collection.description && <p className="mt-2 max-w-xl text-muted">{collection.description}</p>}

        <div className="mt-8">
          {collection.projects.length === 0 ? (
            <Card className="border-dashed py-12 text-center">
              <CardDescription>Nothing in this collection yet.</CardDescription>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {collection.projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description yet."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={`/marketplace/${project.slug}`}
                      className="flex w-fit items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      View listing <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
