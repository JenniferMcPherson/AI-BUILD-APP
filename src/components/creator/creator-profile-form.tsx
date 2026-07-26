"use client";

import { useActionState } from "react";
import { updateCreatorProfile } from "@/app/actions/creator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreatorProfileForm({
  location,
  tagline,
  story,
  buildProcess,
}: {
  location: string | null;
  tagline: string | null;
  story: string | null;
  buildProcess: string | null;
}) {
  const [state, action, pending] = useActionState(updateCreatorProfile, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={location ?? ""}
          maxLength={80}
          placeholder="e.g. Austin, TX"
        />
        {state?.errors?.location && <p className="text-xs text-danger">{state.errors.location[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          name="tagline"
          defaultValue={tagline ?? ""}
          maxLength={100}
          placeholder="What do you build? e.g. Internal tools for small teams"
        />
        {state?.errors?.tagline && <p className="text-xs text-danger">{state.errors.tagline[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="story">Your story</Label>
        <p className="text-xs text-muted">
          A few prompts to get you started: What got you into building? Who or what taught you?
          What do you want people to feel when they use something you made?
        </p>
        <Textarea
          id="story"
          name="story"
          defaultValue={story ?? ""}
          maxLength={4000}
          rows={6}
          placeholder="I started building because..."
        />
        {state?.errors?.story && <p className="text-xs text-danger">{state.errors.story[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="buildProcess">How you build</Label>
        <p className="text-xs text-muted">
          Your process, tools, and principles — the craft behind what&apos;s in your portfolio.
        </p>
        <Textarea
          id="buildProcess"
          name="buildProcess"
          defaultValue={buildProcess ?? ""}
          maxLength={4000}
          rows={5}
          placeholder="I usually start with..."
        />
        {state?.errors?.buildProcess && (
          <p className="text-xs text-danger">{state.errors.buildProcess[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Saving..." : "Save profile"}
        </Button>
        {state?.success && <span className="text-xs text-success">Saved</span>}
      </div>
    </form>
  );
}
