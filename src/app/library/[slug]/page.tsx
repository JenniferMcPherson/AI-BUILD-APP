import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { getOptionalSession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { ArticleContent } from "@/components/library/article-content";
import { DeleteArticleButton } from "@/components/library/delete-article-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await db.article.findUnique({ where: { slug }, select: { title: true } });
  return { title: article ? `${article.title} — Forge Library` : "Article — Forge" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getOptionalSession();

  const article = await db.article.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true, username: true } } },
  });

  if (!article) notFound();

  const citations = article.citations as { text: string; url?: string }[];
  const isAuthor = session?.userId === article.author.id;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated={Boolean(session)} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{article.title}</h1>
          <p className="mt-2 text-sm text-muted">
            By{" "}
            {article.author.username ? (
              <Link href={`/u/${article.author.username}`} className="text-brand hover:underline">
                {article.author.name}
              </Link>
            ) : (
              article.author.name
            )}{" "}
            · {article.createdAt.toLocaleDateString()}
          </p>
          {isAuthor && (
            <div className="mt-3">
              <DeleteArticleButton articleId={article.id} />
            </div>
          )}
        </div>

        <ArticleContent content={article.content} />

        {citations.length > 0 && (
          <div className="mt-12 border-t border-border pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Sources</h2>
            <ol className="flex flex-col gap-1.5 text-sm">
              {citations.map((citation, i) => (
                <li key={i} className="flex items-start gap-2 text-muted">
                  <span>{i + 1}.</span>
                  {citation.url ? (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="flex items-center gap-1 text-brand hover:underline"
                    >
                      {citation.text}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span>{citation.text}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </main>
    </div>
  );
}
