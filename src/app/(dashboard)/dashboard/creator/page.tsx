import Link from "next/link";
import { Layers, Repeat, Star, Users } from "lucide-react";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatorProfileForm } from "@/components/creator/creator-profile-form";

export default async function CreatorDashboardPage() {
  const { userId } = await verifySession();

  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      location: true,
      tagline: true,
      story: true,
      buildProcess: true,
      _count: { select: { followers: true, articles: true } },
      projects: {
        where: { listedInMarketplace: true, status: "PUBLISHED" },
        select: {
          viewCount: true,
          _count: { select: { clones: true } },
          reviews: { select: { rating: true } },
        },
      },
    },
  });

  const totalViews = user.projects.reduce((sum, p) => sum + p.viewCount, 0);
  const totalClones = user.projects.reduce((sum, p) => sum + p._count.clones, 0);
  const allRatings = user.projects.flatMap((p) => p.reviews.map((r) => r.rating));
  const averageRating =
    allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Creator dashboard</h1>
        <p className="text-sm text-muted">Your public presence and how the community is finding you.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile icon={Layers} label="Listed projects" value={user.projects.length} />
        <StatTile icon={Repeat} label="Cloned by others" value={totalClones} />
        <StatTile
          icon={Star}
          label="Reviews"
          value={allRatings.length}
          hint={averageRating !== null ? `${averageRating.toFixed(1)} avg` : undefined}
        />
        <StatTile icon={Users} label="Followers" value={user._count.followers} />
      </div>

      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-sm text-muted">
            Views come from your published projects&apos; page views. Orders, revenue, and visitor
            analytics will appear here once payments are added to the marketplace — there&apos;s no
            real transaction data to show yet, so we&apos;re not showing placeholder numbers.
            {totalViews > 0 && ` Total project views so far: ${totalViews}.`}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/creator/collections" className="text-sm font-medium text-brand hover:underline">
          Manage collections →
        </Link>
        <Link href="/dashboard/creator/messages" className="text-sm font-medium text-brand hover:underline">
          Messages →
        </Link>
        <Link href="/dashboard/following" className="text-sm font-medium text-brand hover:underline">
          Creators you follow →
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your creator profile</CardTitle>
          <CardDescription>
            Shown on your public profile — this is where people connect with you before your projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatorProfileForm
            location={user.location}
            tagline={user.tagline}
            story={user.story}
            buildProcess={user.buildProcess}
          />
        </CardContent>
      </Card>

      {user._count.articles === 0 && (
        <p className="text-xs text-muted">
          Tip: publishing a guide in the{" "}
          <Link href="/library/new" className="text-brand hover:underline">
            Library
          </Link>{" "}
          earns the Community Mentor badge on your profile.
        </p>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-hover text-brand">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-lg font-semibold leading-none text-foreground">{value}</p>
          <p className="mt-0.5 text-xs text-muted">
            {label}
            {hint && <span className="ml-1">· {hint}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
