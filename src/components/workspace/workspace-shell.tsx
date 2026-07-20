"use client";

import { useState } from "react";
import { MessagesSquare, Code2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectChat, type ChatMessage } from "@/components/workspace/project-chat";
import { ProjectPlanPanel, type PlanData } from "@/components/workspace/project-plan-panel";
import { ProjectCodeView, type ProjectFile } from "@/components/workspace/project-code-view";
import { ProjectPreview } from "@/components/workspace/project-preview";

type Tab = "builder" | "code" | "preview";

export function WorkspaceShell({
  projectId,
  projectName,
  initialMessages,
  initialPlan,
  initialFiles,
}: {
  projectId: string;
  projectName: string;
  initialMessages: ChatMessage[];
  initialPlan: PlanData;
  initialFiles: ProjectFile[];
}) {
  const [refreshSignal, setRefreshSignal] = useState(0);
  const [previewSignal, setPreviewSignal] = useState(0);
  const [hasFiles, setHasFiles] = useState(initialFiles.length > 0);
  const [tab, setTab] = useState<Tab>("builder");

  function handleFilesChanged() {
    setHasFiles(true);
    setPreviewSignal((n) => n + 1);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border px-4 py-2">
        <TabButton active={tab === "builder"} onClick={() => setTab("builder")} icon={MessagesSquare}>
          Builder
        </TabButton>
        <TabButton active={tab === "code"} onClick={() => setTab("code")} icon={Code2}>
          Code
        </TabButton>
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")} icon={Eye}>
          Preview
        </TabButton>
      </div>

      <div className={cn("flex flex-1 overflow-hidden", tab !== "builder" && "hidden")}>
        <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col overflow-hidden border-r border-border">
            <ProjectChat
              projectId={projectId}
              initialMessages={initialMessages}
              onReply={() => setRefreshSignal((n) => n + 1)}
            />
          </div>
          <ProjectPlanPanel
            projectId={projectId}
            projectName={projectName}
            initialPlan={initialPlan}
            refreshSignal={refreshSignal}
          />
        </div>
      </div>

      <div className={cn("flex flex-1 overflow-hidden", tab !== "code" && "hidden")}>
        <ProjectCodeView
          projectId={projectId}
          initialFiles={initialFiles}
          hasPlan={Boolean(initialPlan)}
          onFilesChanged={handleFilesChanged}
        />
      </div>

      <div className={cn("flex flex-1 overflow-hidden", tab !== "preview" && "hidden")}>
        <ProjectPreview
          projectId={projectId}
          hasFiles={hasFiles}
          refreshSignal={previewSignal}
          onRefresh={() => setPreviewSignal((n) => n + 1)}
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-surface-hover text-foreground" : "text-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
