import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { getOptionalSession } from "@/lib/dal";
import { PLANS, PLAN_LIMITS } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/billing/checkout-button";

export const metadata = { title: "Pricing — Forge" };

export default async function PricingPage() {
  const session = await getOptionalSession();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-md brand-gradient text-sm font-bold text-brand-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            Forge
          </Link>
          <nav className="flex items-center gap-2">
            {session ? (
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

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-3 text-lg text-muted">
            Start free. Upgrade when you&apos;re ready to build more.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <PlanCard
            name="Free"
            price="$0"
            description="Try the AI builder on a few ideas."
            features={[`${PLAN_LIMITS.FREE} projects`, "AI project planning", "Code generation", "ZIP export"]}
          >
            <Button variant="secondary" className="w-full" asChild>
              <Link href={session ? "/dashboard" : "/register"}>
                {session ? "Current plan" : "Get started"}
              </Link>
            </Button>
          </PlanCard>

          <PlanCard
            name={PLANS.PRO.name}
            price={PLANS.PRO.price}
            description={PLANS.PRO.description}
            features={PLANS.PRO.features}
            highlighted
          >
            {session ? (
              <CheckoutButton plan="PRO" />
            ) : (
              <Button className="w-full" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            )}
          </PlanCard>

          <PlanCard
            name={PLANS.BUSINESS.name}
            price={PLANS.BUSINESS.price}
            description={PLANS.BUSINESS.description}
            features={PLANS.BUSINESS.features}
          >
            {session ? (
              <CheckoutButton plan="BUSINESS" />
            ) : (
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/register">Get started</Link>
              </Button>
            )}
          </PlanCard>

          <PlanCard
            name="Enterprise"
            price="Contact us"
            description="Custom limits, SSO, and support for larger teams."
            features={["Unlimited projects", "SSO & audit logs (soon)", "Dedicated support", "Custom contract"]}
          >
            <Button variant="secondary" className="w-full" asChild>
              <a href="mailto:sales@forge.example">Contact sales</a>
            </Button>
          </PlanCard>
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  name,
  price,
  description,
  features,
  highlighted,
  children,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={highlighted ? "border-brand shadow-md" : undefined}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <p className="text-2xl font-semibold tracking-tight text-foreground">{price}</p>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span className="text-muted">{feature}</span>
            </li>
          ))}
        </ul>
        {children}
      </CardContent>
    </Card>
  );
}
