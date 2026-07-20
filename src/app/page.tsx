import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Rocket, Users, Gauge, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "Describe it, don't code it",
    description:
      "Type what you want in plain English. Forge's AI architect turns it into a real, working plan.",
  },
  {
    icon: Gauge,
    title: "Built for speed",
    description: "From idea to a working project workspace in seconds, not sprint planning meetings.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "Production-grade authentication and data handling from day one, not bolted on later.",
  },
  {
    icon: GitBranch,
    title: "Own your code",
    description: "Export to GitHub, download a ZIP, or publish to a hosted URL. Nothing is locked in.",
  },
  {
    icon: Rocket,
    title: "Ready to scale",
    description: "The same foundation that takes you from your first user to your millionth.",
  },
  {
    icon: Users,
    title: "Built for teams",
    description: "Collaboration, creator profiles, and a community to build alongside — coming soon.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
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
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            The easiest way to build real software
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Build software by
            <span className="brand-gradient-text"> describing it</span>
          </h1>
          <p className="max-w-2xl text-balance text-lg text-muted">
            Forge plans, designs, builds, tests, and deploys applications from a plain-English
            description — so anyone can create real, production-quality software.
          </p>

          <div className="mt-2 flex w-full max-w-xl flex-col items-center gap-3 sm:flex-row">
            <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-left text-sm text-muted shadow-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-brand" />
              <span className="truncate">&ldquo;Build me an app that tracks my daily habits...&rdquo;</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">
                Start building for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="text-xs text-muted">No credit card required. Free plan available.</p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-surface-hover text-brand">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-surface py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Your idea is one sentence away.
            </h2>
            <p className="text-muted">
              Create a free account and start a project in under a minute.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Forge. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
