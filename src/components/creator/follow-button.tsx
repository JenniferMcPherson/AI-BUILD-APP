"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { followCreator, unfollowCreator } from "@/app/actions/follows";

export function FollowButton({
  creatorId,
  username,
  initialFollowing,
}: {
  creatorId: string;
  username: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (following) {
        await unfollowCreator(creatorId, username);
        setFollowing(false);
      } else {
        await followCreator(creatorId, username);
        setFollowing(true);
      }
    });
  }

  return (
    <Button variant={following ? "secondary" : "primary"} size="sm" onClick={toggle} disabled={pending}>
      {following ? "Following" : "Follow"}
    </Button>
  );
}
