import { verifySession } from "@/lib/dal";
import { SiteHeader } from "@/components/marketing/site-header";
import { ArticleEditor } from "@/components/library/article-editor";

export const metadata = { title: "Write an article — Forge" };

export default async function NewArticlePage() {
  await verifySession();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader isAuthenticated />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Write an article</h1>
        <p className="mt-2 text-muted">
          Share something you learned. Original writing with proper sourcing helps everyone.
        </p>
        <div className="mt-8">
          <ArticleEditor />
        </div>
      </main>
    </div>
  );
}
