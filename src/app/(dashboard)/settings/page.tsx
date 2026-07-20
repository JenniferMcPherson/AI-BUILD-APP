import Link from "next/link";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { PLAN_LIMITS } from "@/lib/stripe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { DangerZone } from "@/components/settings/danger-zone";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { InviteList } from "@/components/settings/invite-list";

export default async function SettingsPage() {
  const { userId } = await verifySession();

  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      username: true,
      bio: true,
      planTier: true,
      passwordHash: true,
      isFoundingMember: true,
      _count: { select: { projects: true } },
      invitesSent: {
        orderBy: { createdAt: "desc" },
        select: { id: true, code: true, usedAt: true },
      },
    },
  });

  const limit = PLAN_LIMITS[user.planTier];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">Manage your account, plan, and security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your name and email.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            name={user.name}
            email={user.email}
            username={user.username}
            bio={user.bio}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan &amp; billing</CardTitle>
          <CardDescription>
            You&apos;re on the <span className="font-medium capitalize">{user.planTier.toLowerCase()}</span>{" "}
            plan — {user._count.projects} of {limit ?? "unlimited"} projects used.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" asChild>
            <Link href="/pricing">View plans</Link>
          </Button>
          <ManageBillingButton className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-hover disabled:opacity-50" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invites</CardTitle>
          <CardDescription>
            Invite people to Forge. Anyone who signs up with your code becomes a founding member
            {user.isFoundingMember && " — like you"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteList
            initialCodes={user.invitesSent.map((i) => ({
              id: i.id,
              code: i.code,
              usedAt: i.usedAt ? i.usedAt.toISOString() : null,
            }))}
          />
        </CardContent>
      </Card>

      {user.passwordHash && (
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      )}

      <Card className="border-danger/40">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Permanently delete your account and all your projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <DangerZone email={user.email} />
        </CardContent>
      </Card>
    </div>
  );
}
