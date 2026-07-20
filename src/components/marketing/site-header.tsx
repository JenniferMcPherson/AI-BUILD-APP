import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md brand-gradient text-sm font-bold text-brand-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          Forge
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/discover">Discover</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/marketplace">Marketplace</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
