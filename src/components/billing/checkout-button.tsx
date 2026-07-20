"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/actions/billing";
import type { PlanKey } from "@/lib/stripe";

export function CheckoutButton({ plan }: { plan: PlanKey }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(plan);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button className="w-full" onClick={handleClick} disabled={pending}>
        {pending ? "Redirecting..." : "Upgrade"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
