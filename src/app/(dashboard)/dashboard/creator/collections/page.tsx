import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { CollectionsManager } from "@/components/creator/collections-manager";

export default async function CreatorCollectionsPage() {
  const { userId } = await verifySession();

  const collections = await db.collection.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      _count: { select: { projects: true } },
    },
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-sm text-muted">
          Organize your marketplace listings. Assign a project to a collection from its workspace
          Export menu.
        </p>
      </div>

      <CollectionsManager
        collections={collections.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          projectCount: c._count.projects,
        }))}
      />
    </div>
  );
}
