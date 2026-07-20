import Link from "next/link";
import { Star, Store } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace";

export const metadata = { title: "Marketplace — Forge" };

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const session = await getOptionalSession();

  const listings = await db.project.findMany({
    where: { listedInMarketplace: true, ...(category ? { category } : {}) },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { name: true, username: true } },
      reviews: { select: { rating: true } },
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Marketplace</h1>
          <p className="mt-3 text-lg text-muted">
            Templates and apps published by the community. Use one as a starting point for your
            own project.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link href="/marketplace">
            <Badge variant={!category ? "default" : "secondary"}>All</Badge>
          </Link>
          {MARKETPLACE_CATEGORIES.map((c) => (
            <Link key={c} href={`/marketplace?category=${encodeURIComponent(c)}`}>
              <Badge variant={category === c ? "default" : "secondary"}>{c}</Badge>
            </Link>
          ))}
        </div>

        {listings.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-brand-foreground">
              <Store className="h-6 w-6" />
            </span>
            <CardTitle>Nothing listed yet</CardTitle>
            <CardDescription className="max-w-sm">
              Publish a project and list it from its workspace to show it here.
            </CardDescription>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((project) => {
              const avg =
                project.reviews.length > 0
                  ? project.reviews.reduce((sum, r) => sum + r.rating, 0) / project.reviews.length
                  : null;
              return (
                <Link key={project.id} href={`/marketplace/${project.slug}`}>
                  <Card className="h-full transition-colors hover:bg-surface-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                        {project.category && <Badge variant="secondary">{project.category}</Badge>}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No description yet."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-xs text-muted">
                      <span>{project.owner.name}</span>
                      {avg !== null ? (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current text-warning" />
                          {avg.toFixed(1)} ({project.reviews.length})
                        </span>
                      ) : (
                        <span>No reviews yet</span>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
