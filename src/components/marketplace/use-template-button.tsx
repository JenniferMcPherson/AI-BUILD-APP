"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cloneProjectAsTemplate } from "@/app/actions/marketplace";

export function UseTemplateButton({ projectSlug }: { projectSlug: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await cloneProjectAsTemplate(projectSlug);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button onClick={handleClick} disabled={pending}>
        {pending ? "Cloning..." : "Use this template"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
