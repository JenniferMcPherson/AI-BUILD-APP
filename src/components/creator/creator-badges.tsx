import { Badge } from "@/components/ui/badge";
import type { CreatorBadge } from "@/lib/creator";

export function CreatorBadges({ badges }: { badges: CreatorBadge[] }) {
  if (badges.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {badges.map((badge) => (
          <Badge key={badge.key} title={badge.description}>
            {badge.label}
          </Badge>
        ))}
      </div>
      <details className="text-xs text-muted">
        <summary className="cursor-pointer select-none">What do these mean?</summary>
        <dl className="mt-2 flex flex-col gap-1.5">
          {badges.map((badge) => (
            <div key={badge.key}>
              <dt className="font-medium text-foreground">{badge.label}</dt>
              <dd>{badge.description}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
