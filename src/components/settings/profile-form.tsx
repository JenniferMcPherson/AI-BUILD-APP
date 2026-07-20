"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  name,
  email,
  username,
  bio,
}: {
  name: string;
  email: string;
  username: string | null;
  bio: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
        {state?.errors?.name && <p className="text-xs text-danger">{state.errors.name[0]}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted">forge.app/u/</span>
          <Input id="username" name="username" defaultValue={username ?? ""} required />
        </div>
        {state?.errors?.username && (
          <p className="text-xs text-danger">{state.errors.username[0]}</p>
        )}
        <p className="text-xs text-muted">Your public creator profile URL.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={bio ?? ""} rows={3} maxLength={280} />
        {state?.errors?.bio && <p className="text-xs text-danger">{state.errors.bio[0]}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled />
        <p className="text-xs text-muted">Contact support to change your email address.</p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving..." : "Save changes"}
        </Button>
        {state?.success && <span className="text-xs text-success">Saved</span>}
      </div>
    </form>
  );
}
