import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Star } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { computeCreatorBadges } from "@/lib/creator";
import { reportCreator } from "@/app/actions/reports";
import { SiteHeader } from "@/components/marketing/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatorBadges } from "@/components/creator/creator-badges";
import { FollowButton } from "@/components/creator/follow-button";
import { ReportDialog } from "@/components/creator/report-dialog";

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
  const user = await db.user.findUnique({ where: { username }, select: { name: true, bio: true } });
  if (!user) return { title: `${username} — Forge` };
  return {
    title: `${user.name} (@${username}) — Forge`,
    description: user.bio ?? `${user.name}'s projects, built with Forge.`,
  };
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
      id: true,
      name: true,
      username: true,
      bio: true,
      location: true,
      tagline: true,
      story: true,
      buildProcess: true,
      createdAt: true,
      isFoundingMember: true,
      emailVerified: true,
      projects: {
        where: { status: "PUBLISHED", listedInMarketplace: true },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          collectionId: true,
          _count: { select: { clones: true } },
          reviews: { select: { rating: true } },
        },
      },
      collections: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          _count: { select: { projects: true } },
        },
      },
      _count: { select: { followers: true, articles: true } },
    },
  });

  if (!user) notFound();

  const isOwnProfile = session?.userId === user.id;
  const isFollowing = session && !isOwnProfile
    ? Boolean(
        await db.follow.findUnique({
          where: { followerId_creatorId: { followerId: session.userId, creatorId: user.id } },
        })
      )
    : false;

  const allRatings = user.projects.flatMap((p) => p.reviews.map((r) => r.rating));
  const averageRating =
    allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : null;
  const totalClones = user.projects.reduce((sum, p) => sum + p._count.clones, 0);

  const badges = computeCreatorBadges({
    emailVerified: Boolean(user.emailVerified),
    isFoundingMember: user.isFoundingMember,
    listedProjectCount: user.projects.length,
    reviewCount: allRatings.length,
    averageRating,
    articleCount: user._count.articles,
    followerCount: user._count.followers,
  });

  const uncategorized = user.projects.filter((p) => !p.collectionId);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full brand-gradient text-xl font-semibold text-brand-foreground">
            {initials(user.name) || "U"}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
              {user.isFoundingMember && <Badge>Founding member</Badge>}
            </div>
            <p className="text-sm text-muted">@{user.username}</p>
            {user.tagline && <p className="mt-1 text-sm font-medium text-foreground">{user.tagline}</p>}
            <p className="mt-2 text-xs text-muted">
              {user.location && <>{user.location} · </>}
              Building since {user.createdAt.toLocaleDateString(undefined, { year: "numeric", month: "long" })}
            </p>
            {user.bio && <p className="mt-2 max-w-xl text-sm text-foreground">{user.bio}</p>}

            <div className="mt-3">
              <CreatorBadges badges={badges} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              {session && !isOwnProfile && (
                <FollowButton creatorId={user.id} username={username} initialFollowing={isFollowing} />
              )}
              {session && !isOwnProfile && (
                <ReportDialog label={user.name} action={reportCreator.bind(null, user.id)} />
              )}
            </div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Listed projects" value={user.projects.length} />
          <StatTile label="Cloned by others" value={totalClones} />
          <StatTile
            label="Reviews"
            value={allRatings.length}
            hint={averageRating !== null ? `${averageRating.toFixed(1)} ★ avg` : undefined}
          />
          <StatTile label="Followers" value={user._count.followers} />
        </div>

        {user.story && (
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Story</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{user.story}</p>
          </section>
        )}

        {user.buildProcess && (
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">How they build</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{user.buildProcess}</p>
          </section>
        )}

        {user.collections.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">Collections</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {user.collections.map((collection) => (
                <Link key={collection.id} href={`/u/${user.username}/collections/${collection.slug}`}>
                  <Card className="h-full transition-colors hover:bg-surface-hover">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{collection.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {collection.description || `${collection._count.projects} project(s)`}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            {user.collections.length > 0 ? "More projects" : "Published projects"}
          </h2>

          {uncategorized.length === 0 ? (
            <Card className="border-dashed py-12 text-center">
              <CardDescription>Nothing published yet.</CardDescription>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {uncategorized.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description || "No description yet."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <a
                      href={`/marketplace/${project.slug}`}
                      className="flex w-fit items-center gap-1 text-sm font-medium text-brand hover:underline"
                    >
                      View listing <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {project.reviews.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Star className="h-3.5 w-3.5 fill-current text-warning" />
                        {(
                          project.reviews.reduce((sum, r) => sum + r.rating, 0) / project.reviews.length
                        ).toFixed(1)}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatTile({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-lg font-semibold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted">
          {label}
          {hint && <span className="ml-1">· {hint}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
