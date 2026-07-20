"use client";

import { useState, useTransition } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createInviteCode } from "@/app/actions/invites";
import { MAX_INVITES_PER_USER } from "@/lib/invite";

export type InviteCodeItem = { id: string; code: string; usedAt: string | null };

export function InviteList({ initialCodes }: { initialCodes: InviteCodeItem[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function generate() {
    setError(null);
    startTransition(async () => {
      const result = await createInviteCode();
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.id && result?.code) {
        setCodes((prev) => [...prev, { id: result.id, code: result.code, usedAt: null }]);
      }
    });
  }

  function copyLink(item: InviteCodeItem) {
    const url = `${window.location.origin}/register?invite=${item.code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="flex flex-col gap-3">
      {codes.length === 0 ? (
        <p className="text-sm text-muted">
          Generate an invite link to share Forge and become a founding member sponsor.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {codes.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <p className="font-mono text-sm">{item.code}</p>
                <p className="text-xs text-muted">{item.usedAt ? "Used" : "Not used yet"}</p>
              </div>
              {!item.usedAt && (
                <Button variant="ghost" size="icon" onClick={() => copyLink(item)} aria-label="Copy invite link">
                  {copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button
        variant="secondary"
        size="sm"
        className="w-fit"
        onClick={generate}
        disabled={pending || codes.length >= MAX_INVITES_PER_USER}
      >
        <UserPlus className="h-3.5 w-3.5" />
        {pending ? "Generating..." : "Generate invite link"}
      </Button>
    </div>
  );
}
