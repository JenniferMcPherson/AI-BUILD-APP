"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, Sparkles, CreditCard } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { createBillingPortalSession } from "@/app/actions/billing";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Topbar({ userName, planTier }: { userName: string; planTier: string }) {
  const [open, setOpen] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingPending, setBillingPending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function manageBilling() {
    setBillingPending(true);
    setBillingError(null);
    const result = await createBillingPortalSession();
    if (result?.error) setBillingError(result.error);
    setBillingPending(false);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
      <div />
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 text-sm hover:bg-surface-hover"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full brand-gradient text-xs font-semibold text-brand-foreground">
            {initials(userName) || "U"}
          </span>
          <span className="hidden max-w-32 truncate sm:inline">{userName}</span>
        </button>
        <div
          className={cn(
            "absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-border bg-surface p-1 shadow-lg transition",
            open ? "visible opacity-100" : "invisible opacity-0"
          )}
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="text-xs capitalize text-muted">{planTier.toLowerCase()} plan</p>
          </div>
          <div className="my-1 h-px bg-border" />
          {planTier === "FREE" && (
            <Link
              href="/pricing"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade plan
            </Link>
          )}
          <button
            type="button"
            onClick={manageBilling}
            disabled={billingPending}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-surface-hover disabled:opacity-50"
          >
            <CreditCard className="h-4 w-4" />
            {billingPending ? "Opening..." : "Manage billing"}
          </button>
          {billingError && <p className="px-3 pb-1 text-xs text-danger">{billingError}</p>}
          <div className="my-1 h-px bg-border" />
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-surface-hover"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
