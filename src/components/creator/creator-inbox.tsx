"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { markThreadRead } from "@/app/actions/creator-messages";

export type ThreadSummary = {
  projectId: string;
  projectName: string;
  projectSlug: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
};

export function CreatorInbox({ threads }: { threads: ThreadSummary[] }) {
  const [readState, setReadState] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();

  if (threads.length === 0) {
    return <p className="text-sm text-muted">No messages yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {threads.map((thread) => {
        const key = `${thread.projectId}:${thread.otherUserId}`;
        const isUnread = thread.unread && !readState[key];

        return (
          <div
            key={key}
            className="flex items-start justify-between gap-4 rounded-md border border-border p-4"
          >
            <div>
              <p className="text-sm font-medium">
                {thread.otherUserName} <span className="font-normal text-muted">— {thread.projectName}</span>
                {isUnread && (
                  <span className="ml-2 rounded-full bg-brand px-1.5 py-0.5 text-[10px] text-brand-foreground">
                    New
                  </span>
                )}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{thread.lastMessage}</p>
              <p className="mt-1 text-xs text-muted">{thread.lastMessageAt}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Link
                href={`/marketplace/${thread.projectSlug}`}
                className="text-xs text-brand hover:underline"
              >
                View listing
              </Link>
              {isUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await markThreadRead(thread.projectId, thread.otherUserId);
                      setReadState((prev) => ({ ...prev, [key]: true }));
                    })
                  }
                >
                  Mark read
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
