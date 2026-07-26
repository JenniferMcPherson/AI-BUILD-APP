"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";
import { assignProjectToCollection } from "@/app/actions/collections";

export function CollectionPicker({
  projectId,
  collections,
  initialCollectionId,
}: {
  projectId: string;
  collections: { id: string; title: string }[];
  initialCollectionId: string | null;
}) {
  const [value, setValue] = useState(initialCollectionId ?? "");
  const [pending, setPending] = useState(false);

  if (collections.length === 0) return null;

  async function handleChange(next: string) {
    setValue(next);
    setPending(true);
    await assignProjectToCollection(projectId, next || null);
    setPending(false);
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        <FolderKanban className="h-4 w-4 text-muted" />
        Collection
      </div>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={pending}
        className="h-9 w-full rounded-md border border-border bg-surface px-2 text-sm"
      >
        <option value="">No collection</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  );
}
