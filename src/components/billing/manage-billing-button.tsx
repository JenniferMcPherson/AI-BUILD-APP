"use client";

import { useState } from "react";
import { createBillingPortalSession } from "@/app/actions/billing";
import { cn } from "@/lib/utils";

export function ManageBillingButton({
  className,
  children,
}: {
  className?: string;
  children?: (pending: boolean) => React.ReactNode;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await createBillingPortalSession();
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button type="button" onClick={handleClick} disabled={pending} className={cn(className)}>
        {children ? children(pending) : pending ? "Opening..." : "Manage billing"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
