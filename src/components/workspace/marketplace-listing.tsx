"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listInMarketplace, unlistFromMarketplace } from "@/app/actions/marketplace";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace";

export function MarketplaceListing({
  projectId,
  projectSlug,
  isPublished,
  initialListed,
  initialCategory,
}: {
  projectId: string;
  projectSlug: string;
  isPublished: boolean;
  initialListed: boolean;
  initialCategory: string | null;
}) {
  const [listed, setListed] = useState(initialListed);
  const [category, setCategory] = useState(initialCategory);
  const [selectedCategory, setSelectedCategory] = useState(MARKETPLACE_CATEGORIES[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleList() {
    setPending(true);
    setError(null);
    const formData = new FormData();
    formData.set("category", selectedCategory);
    const result = await listInMarketplace(projectId, undefined, formData);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setListed(true);
      setCategory(result.category ?? selectedCategory);
    }
    setPending(false);
  }

  async function handleUnlist() {
    setPending(true);
    await unlistFromMarketplace(projectId);
    setListed(false);
    setPending(false);
  }

  return (
    <div className="rounded-md border border-border p-3">
      <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        <Store className="h-4 w-4 text-muted" />
        Marketplace
      </div>
      {!isPublished ? (
        <p className="text-xs text-muted">Publish the hosted URL first to list this project.</p>
      ) : listed ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted">
            Listed under <span className="font-medium text-foreground">{category}</span>.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <a href={`/marketplace/${projectSlug}`} target="_blank" rel="noopener noreferrer">
                View listing
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleUnlist} disabled={pending}>
              {pending ? "Unlisting..." : "Unlist"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
          >
            {MARKETPLACE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={handleList} disabled={pending}>
            {pending ? "Listing..." : "List it"}
          </Button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
