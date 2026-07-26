import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Star } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/marketplace/review-form";
import { UseTemplateButton } from "@/components/marketplace/use-template-button";
import { MessageCreatorForm } from "@/components/creator/message-creator-form";
import { ReportDialog } from "@/components/creator/report-dialog";
import { reportProject } from "@/app/actions/reports";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await db.project.findFirst({
    where: { slug, listedInMarketplace: true },
    select: { name: true, description: true },
  });
  if (!project) return { title: "Listing — Forge" };
  return {
    title: `${project.name} — Marketplace — Forge`,
    description: project.description ?? `Use ${project.name} as a starting point for your own project.`,
  };
}

export default async function MarketplaceListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getOptionalSession();

  const project = await db.project.findFirst({
    where: { slug, listedInMarketplace: true },
    include: {
      owner: { select: { name: true, username: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
      clonedFrom: {
        select: { name: true, slug: true, owner: { select: { name: true, username: true } } },
      },
      _count: { select: { clones: true } },
    },
  });

  if (!project) notFound();

  const avg =
    project.reviews.length > 0
      ? project.reviews.reduce((sum, r) => sum + r.rating, 0) / project.reviews.length
      : null;

  const isOwner = session?.userId === project.ownerId;
  const alreadyReviewed = session ? project.reviews.some((r) => r.userId === session.userId) : false;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="mb-2 flex items-center gap-2">
          {project.category && <Badge variant="secondary">{project.category}</Badge>}
          {avg !== null && (
            <span className="flex items-center gap-1 text-sm text-muted">
              <Star className="h-4 w-4 fill-current text-warning" />
              {avg.toFixed(1)} ({project.reviews.length} review{project.reviews.length === 1 ? "" : "s"})
            </span>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-2 max-w-xl text-muted">{project.description || "No description yet."}</p>
        <p className="mt-2 text-sm text-muted">
          By{" "}
          {project.owner.username ? (
            <Link href={`/u/${project.owner.username}`} className="text-brand hover:underline">
              {project.owner.name}
            </Link>
          ) : (
            project.owner.name
          )}
        </p>
        {project.clonedFrom && (
          <p className="mt-1 text-xs text-muted">
            Based on{" "}
            {project.clonedFrom.owner.username ? (
              <Link href={`/marketplace/${project.clonedFrom.slug}`} className="text-brand hover:underline">
                {project.clonedFrom.name}
              </Link>
            ) : (
              project.clonedFrom.name
            )}{" "}
            by {project.clonedFrom.owner.name}
          </p>
        )}
        {project._count.clones > 0 && (
          <p className="mt-1 text-xs text-muted">
            Used as a starting point by {project._count.clones} builder
            {project._count.clones === 1 ? "" : "s"}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!isOwner &&
            (session ? (
              <UseTemplateButton projectSlug={project.slug} />
            ) : (
              <Button asChild>
                <Link href="/register">Sign up to use this template</Link>
              </Button>
            ))}
          <Button variant="secondary" asChild>
            <a href={`/p/${project.slug}`} target="_blank" rel="noopener noreferrer">
              Open live preview
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          {session && !isOwner && <MessageCreatorForm projectSlug={project.slug} creatorName={project.owner.name} />}
          {session && !isOwner && <ReportDialog label="listing" action={reportProject.bind(null, project.id)} />}
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-border">
          <iframe
            src={`/p/${project.slug}`}
            title={`${project.name} preview`}
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
            className="h-96 w-full bg-white"
          />
        </div>

        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Reviews</h2>

          {session && !isOwner && !alreadyReviewed && <ReviewForm projectSlug={project.slug} />}

          <div className="mt-6 flex flex-col gap-4">
            {project.reviews.length === 0 ? (
              <p className="text-sm text-muted">No reviews yet.</p>
            ) : (
              project.reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{review.user.name}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <Star
                          key={v}
                          className={cn(
                            "h-3.5 w-3.5",
                            review.rating >= v ? "fill-current text-warning" : "text-muted"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-muted">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
