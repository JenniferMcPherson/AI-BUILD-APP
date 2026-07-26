import Link from "next/link";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowButton } from "@/components/creator/follow-button";

export default async function FollowingPage() {
  const { userId } = await verifySession();

  const following = await db.follow.findMany({
    where: { followerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
          tagline: true,
          projects: {
            where: { status: "PUBLISHED", listedInMarketplace: true },
            orderBy: { updatedAt: "desc" },
            take: 1,
            select: { name: true, slug: true },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Creators you follow</h1>
        <p className="text-sm text-muted">Their newest published project, at a glance.</p>
      </div>

      {following.length === 0 ? (
        <Card className="border-dashed py-12 text-center">
          <CardDescription>
            You&apos;re not following anyone yet — visit a creator&apos;s profile to follow them.
          </CardDescription>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {following.map(({ creator }) => (
            <Card key={creator.id}>
              <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle>
                    {creator.username ? (
                      <Link href={`/u/${creator.username}`} className="hover:underline">
                        {creator.name}
                      </Link>
                    ) : (
                      creator.name
                    )}
                  </CardTitle>
                  {creator.tagline && <CardDescription>{creator.tagline}</CardDescription>}
                </div>
                {creator.username && (
                  <FollowButton creatorId={creator.id} username={creator.username} initialFollowing />
                )}
              </CardHeader>
              {creator.projects[0] && (
                <CardContent>
                  <Link
                    href={`/marketplace/${creator.projects[0].slug}`}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Latest: {creator.projects[0].name} →
                  </Link>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
