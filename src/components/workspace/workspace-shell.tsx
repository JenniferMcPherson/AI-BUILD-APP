"use client";

import { useState } from "react";
import { ProjectChat, type ChatMessage } from "@/components/workspace/project-chat";
import { ProjectPlanPanel, type PlanData } from "@/components/workspace/project-plan-panel";

export function WorkspaceShell({
  projectId,
  projectName,
  initialMessages,
  initialPlan,
}: {
  projectId: string;
  projectName: string;
  initialMessages: ChatMessage[];
  initialPlan: PlanData;
}) {
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
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
  );
}
