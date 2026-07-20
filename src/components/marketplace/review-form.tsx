"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { submitReview, type ReviewState } from "@/app/actions/marketplace";

export function ReviewForm({ projectSlug }: { projectSlug: string }) {
  const boundAction = submitReview.bind(null, projectSlug);
  const [state, action, pending] = useActionState<ReviewState, FormData>(boundAction, undefined);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                "h-5 w-5",
                (hovered ?? rating) >= value ? "fill-current text-warning" : "text-muted"
              )}
            />
          </button>
        ))}
      </div>
      <input type="hidden" name="rating" value={rating} />
      <Textarea name="comment" placeholder="Share your thoughts (optional)" rows={3} maxLength={500} />
      {state?.errors?.rating && <p className="text-xs text-danger">{state.errors.rating[0]}</p>}
      {state?.errors?.comment && <p className="text-xs text-danger">{state.errors.comment[0]}</p>}
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
