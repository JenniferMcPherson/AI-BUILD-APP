"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteArticle } from "@/app/actions/library";

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Delete this article? This can't be undone.")) return;
    startTransition(() => deleteArticle(articleId));
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={pending}>
      <Trash2 className="h-3.5 w-3.5" />
      {pending ? "Deleting..." : "Delete article"}
    </Button>
  );
}
