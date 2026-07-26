"use client";

import { useEffect, useRef, useState } from "react";
import { Download, GitBranch, Globe, Share2, Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishProject, unpublishProject } from "@/app/actions/projects";
import { MarketplaceListing } from "@/components/workspace/marketplace-listing";
import { CollectionPicker } from "@/components/creator/collection-picker";

type GithubStatus = { configured: boolean; connected: boolean } | null;

export function ExportMenu({
  projectId,
  projectSlug,
  initialStatus,
  hasFiles,
  initialListed,
  initialCategory,
  collections,
  initialCollectionId,
}: {
  projectId: string;
  projectSlug: string;
  initialStatus: string;
  hasFiles: boolean;
  initialListed: boolean;
  initialCategory: string | null;
  collections: { id: string; title: string }[];
  initialCollectionId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [githubStatus, setGithubStatus] = useState<GithubStatus>(null);
  const [githubPushing, setGithubPushing] = useState(false);
  const [githubResult, setGithubResult] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const hostedUrl = typeof window !== "undefined" ? `${window.location.origin}/p/${projectSlug}` : "";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && githubStatus === null) {
      fetch("/api/integrations/github/status")
        .then((r) => r.json())
        .then(setGithubStatus)
        .catch(() => setGithubStatus({ configured: false, connected: false }));
    }
  }, [open, githubStatus]);

  async function togglePublish() {
    setPublishing(true);
    setPublishError(null);
    const result =
      status === "PUBLISHED" ? await unpublishProject(projectId) : await publishProject(projectId);
    if (result?.error) {
      setPublishError(result.error);
    } else {
      setStatus(status === "PUBLISHED" ? "READY" : "PUBLISHED");
    }
    setPublishing(false);
  }

  function copyUrl() {
    navigator.clipboard.writeText(hostedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function pushToGithub() {
    setGithubPushing(true);
    setGithubError(null);
    setGithubResult(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/export/github`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setGithubError(data.error ?? "Couldn't push to GitHub.");
        return;
      }
      setGithubResult(data.url);
    } catch {
      setGithubError("Couldn't reach GitHub. Please try again.");
    } finally {
      setGithubPushing(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
        <Share2 className="h-4 w-4" />
        Export
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-lg border border-border bg-surface p-3 shadow-lg">
          <div className="flex flex-col gap-3">
            <a
              href={`/api/projects/${projectId}/export/zip`}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-hover"
            >
              <Download className="h-4 w-4 text-muted" />
              <span className="flex-1">Download ZIP</span>
            </a>

            <div className="rounded-md border border-border p-3">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4 text-muted" />
                Hosted URL
              </div>
              {status === "PUBLISHED" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <code className="flex-1 truncate rounded bg-surface-hover px-2 py-1 text-xs">
                      /p/{projectSlug}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyUrl} aria-label="Copy hosted URL">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" asChild aria-label="Open hosted URL">
                      <a href={`/p/${projectSlug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={togglePublish} disabled={publishing}>
                    {publishing ? "Unpublishing..." : "Unpublish"}
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={togglePublish} disabled={publishing || !hasFiles}>
                  {publishing ? "Publishing..." : "Publish"}
                </Button>
              )}
              {publishError && <p className="mt-1.5 text-xs text-danger">{publishError}</p>}
              {!hasFiles && status !== "PUBLISHED" && (
                <p className="mt-1.5 text-xs text-muted">Generate code before publishing.</p>
              )}
            </div>

            <MarketplaceListing
              projectId={projectId}
              projectSlug={projectSlug}
              isPublished={status === "PUBLISHED"}
              initialListed={initialListed}
              initialCategory={initialCategory}
            />

            <CollectionPicker
              projectId={projectId}
              collections={collections}
              initialCollectionId={initialCollectionId}
            />

            <div className="rounded-md border border-border p-3">
              <div className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                <GitBranch className="h-4 w-4 text-muted" />
                GitHub
              </div>
              {githubStatus === null ? (
                <p className="text-xs text-muted">Checking connection...</p>
              ) : !githubStatus.configured ? (
                <p className="text-xs text-muted">Not set up by the workspace admin yet.</p>
              ) : !githubStatus.connected ? (
                <Button size="sm" variant="secondary" asChild>
                  <a href={`/api/integrations/github/connect?returnTo=/projects/${projectId}`}>
                    Connect GitHub
                  </a>
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={pushToGithub} disabled={githubPushing || !hasFiles}>
                    {githubPushing ? "Pushing..." : "Push to a new repo"}
                  </Button>
                  {githubResult && (
                    <a
                      href={githubResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-brand hover:underline"
                    >
                      View repository <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {githubError && <p className="text-xs text-danger">{githubError}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
