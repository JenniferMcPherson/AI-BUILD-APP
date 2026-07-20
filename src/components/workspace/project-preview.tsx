"use client";

import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectPreview({
  projectId,
  hasFiles,
  refreshSignal,
  onRefresh,
}: {
  projectId: string;
  hasFiles: boolean;
  refreshSignal: number;
  onRefresh: () => void;
}) {
  const previewUrl = `/api/projects/${projectId}/preview/index.html`;

  if (!hasFiles) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-muted">
        <p className="text-sm">Generate code in the Code tab to see a live preview here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs text-muted">{previewUrl}</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh preview">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Open preview in new tab">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
      {/*
        allow-same-origin is required so generated prototypes can use localStorage, as
        instructed in their generation prompt. The served content is same-origin and
        gated by this project's own authenticated preview route, not third-party content.
        A future hardening pass should move previews to a separate sandboxed subdomain.
      */}
      <iframe
        key={refreshSignal}
        src={previewUrl}
        title="Project preview"
        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-same-origin"
        className="flex-1 bg-white"
      />
    </div>
  );
}
