"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createArticle } from "@/app/actions/library";
import { MAX_CITATIONS } from "@/lib/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ArticleEditor() {
  const [state, action, pending] = useActionState(createArticle, undefined);
  const [citationCount, setCitationCount] = useState(1);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="How I built a habit tracker in a weekend" required />
        {state?.errors?.title && <p className="text-xs text-danger">{state.errors.title[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          placeholder="A one or two sentence summary shown in search results."
          rows={2}
          required
        />
        {state?.errors?.excerpt && <p className="text-xs text-danger">{state.errors.excerpt[0]}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          placeholder={"Write your article here.\n\nUse a blank line between paragraphs, \"## \" for a heading, \"- \" for a bullet list, and **bold** for emphasis."}
          rows={16}
          required
          className="font-mono text-sm"
        />
        {state?.errors?.content && <p className="text-xs text-danger">{state.errors.content[0]}</p>}
      </div>

      <div className="flex flex-col gap-3">
        <Label>Sources &amp; citations</Label>
        <p className="text-xs text-muted">
          Credit anything you referenced or adapted — original sourcing keeps the library trustworthy.
        </p>
        {Array.from({ length: citationCount }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr]">
            <Input name={`citationText${i}`} placeholder="Source title or description" />
            <Input name={`citationUrl${i}`} placeholder="https://... (optional)" />
          </div>
        ))}
        {citationCount < MAX_CITATIONS && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => setCitationCount((n) => n + 1)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add another source
          </Button>
        )}
      </div>

      {state?.message && <p className="text-xs text-danger">{state.message}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Publishing..." : "Publish article"}
      </Button>
    </form>
  );
}
