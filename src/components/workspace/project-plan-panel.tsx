"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PlanData = {
  summary: string;
  features: { title: string; description: string }[];
  dataModel: { name: string; fields: { name: string; type: string; description?: string }[] }[];
  buildSteps: string[];
} | null;

export function ProjectPlanPanel({
  projectId,
  initialPlan,
  refreshSignal,
  projectName,
}: {
  projectId: string;
  initialPlan: PlanData;
  refreshSignal: number;
  projectName: string;
}) {
  const [plan, setPlan] = useState<PlanData>(initialPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (refreshSignal === 0) return;
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/plan`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.plan) setPlan(data.plan);
      } catch {
        // best-effort background refresh; ignore failures
      }
    }, 2500);
    return () => clearTimeout(timeout);
  }, [refreshSignal, projectId]);

  async function regenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/plan`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't generate a plan.");
        return;
      }
      setPlan(data.plan);
    } catch {
      setError("Couldn't reach the AI architect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="hidden flex-col gap-4 overflow-y-auto p-6 lg:flex">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Project plan</h2>
          <p className="mt-1 text-sm text-muted">
            {plan
              ? "Kept in sync as you chat with the AI architect."
              : `As you chat with the AI architect, the plan for ${projectName} will take shape here.`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={regenerate}
          disabled={loading}
          aria-label="Regenerate plan"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {!plan ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
          No plan yet. Send a message describing your app, or click regenerate once you have.
        </div>
      ) : (
        <div className="flex flex-col gap-6 text-sm">
          <div>
            <p className="text-foreground">{plan.summary}</p>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Sparkles className="h-3.5 w-3.5" />
              Features
            </h3>
            <ul className="flex flex-col gap-2">
              {plan.features.map((feature) => (
                <li key={feature.title} className="rounded-md border border-border bg-surface p-3">
                  <p className="font-medium text-foreground">{feature.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Data model
            </h3>
            <div className="flex flex-col gap-3">
              {plan.dataModel.map((entity) => (
                <div key={entity.name} className="rounded-md border border-border bg-surface p-3">
                  <p className="font-mono text-xs font-semibold text-brand">{entity.name}</p>
                  <ul className="mt-1.5 flex flex-col gap-1">
                    {entity.fields.map((field) => (
                      <li key={field.name} className="flex items-baseline gap-2 text-xs">
                        <span className="font-mono text-foreground">{field.name}</span>
                        <span className="text-muted">{field.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              Build order
            </h3>
            <ol className="flex flex-col gap-1.5">
              {plan.buildSteps.map((step, i) => (
                <li key={step} className="flex gap-2 text-xs text-foreground">
                  <span className="text-muted">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </aside>
  );
}
