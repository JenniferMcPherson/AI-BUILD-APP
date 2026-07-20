import Link from "next/link";
import { BookOpen, PenSquare, Search } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Library — Forge" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await getOptionalSession();

  const articles = await db.article.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, username: true } } },
    take: 50,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Library</h1>
            <p className="mt-3 text-lg text-muted">
              Guides and write-ups from the community, with sources credited.
            </p>
          </div>
          {session && (
            <Button asChild>
              <Link href="/library/new">
                <PenSquare className="h-4 w-4" />
                Write an article
              </Link>
            </Button>
          )}
        </div>

        <form className="mb-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input name="q" defaultValue={q ?? ""} placeholder="Search articles..." className="pl-9" />
          </div>
        </form>

        {articles.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-brand-foreground">
              <BookOpen className="h-6 w-6" />
            </span>
            <CardTitle>{q ? "No matching articles" : "Nothing published yet"}</CardTitle>
            <CardDescription className="max-w-sm">
              {q
                ? "Try a different search term."
                : "Be the first to share a guide or write-up with the community."}
            </CardDescription>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <Link key={article.id} href={`/library/${article.slug}`}>
                <Card className="transition-colors hover:bg-surface-hover">
                  <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted">
                    By {article.author.name} · {article.createdAt.toLocaleDateString()}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
