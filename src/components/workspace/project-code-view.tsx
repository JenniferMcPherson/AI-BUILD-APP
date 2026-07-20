"use client";

import { useState } from "react";
import { Code2, FileCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProjectFile = { path: string; content: string };

function languageFor(path: string) {
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".json")) return "json";
  return "text";
}

export function ProjectCodeView({
  projectId,
  initialFiles,
  hasPlan,
}: {
  projectId: string;
  initialFiles: ProjectFile[];
  hasPlan: boolean;
}) {
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [selectedPath, setSelectedPath] = useState<string | null>(initialFiles[0]?.path ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = files.find((f) => f.path === selectedPath) ?? files[0] ?? null;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/files`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't generate code.");
        return;
      }
      setFiles(data.files);
      setSelectedPath(data.files[0]?.path ?? null);
    } catch {
      setError("Couldn't reach the AI developer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full brand-gradient text-brand-foreground">
          <Code2 className="h-6 w-6" />
        </span>
        <div className="max-w-sm">
          <p className="font-medium text-foreground">No code yet</p>
          <p className="mt-1 text-sm text-muted">
            {hasPlan
              ? "Generate a working prototype from your project plan — plain HTML, CSS, and JavaScript, ready to preview and export."
              : "Chat with the AI architect to build a plan first, then generate code from it here."}
          </p>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button onClick={generate} disabled={loading || !hasPlan}>
          {loading ? "Generating..." : "Generate code"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex w-56 shrink-0 flex-col border-r border-border">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Files</span>
          <Button variant="ghost" size="icon" onClick={generate} disabled={loading} aria-label="Regenerate code">
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {files.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedPath(file.path)}
              className={cn(
                "flex items-center gap-2 truncate rounded-md px-2.5 py-1.5 text-left text-sm",
                selected?.path === file.path
                  ? "bg-surface-hover text-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <FileCode className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{file.path}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        {error && <p className="border-b border-border px-4 py-2 text-xs text-danger">{error}</p>}
        {selected && (
          <>
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-xs text-muted">{selected.path}</span>
              <span className="text-xs uppercase text-muted">{languageFor(selected.path)}</span>
            </div>
            <pre className="flex-1 overflow-auto p-4 text-xs leading-relaxed">
              <code className="font-mono text-foreground">{selected.content}</code>
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
