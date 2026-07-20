import "server-only";

import Anthropic from "@anthropic-ai/sdk";

const BUILDER_SYSTEM_PROMPT = `You are the AI software architect inside an AI-powered app-building platform.
A user describes, in plain English, an application they want built. Your job in this conversation is to:
1. Ask clarifying questions when the request is ambiguous.
2. Propose a clear, concrete plan: core features, suggested data model, and a rough build order.
3. Keep responses concise, structured, and encouraging. Avoid jargon a beginner wouldn't know.
You are not writing code yet in this conversation — you are planning the project with the user.`;

export type BuilderMessage = {
  role: "user" | "assistant";
  content: string;
};

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

function getClient() {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function generateBuilderReply(
  history: BuilderMessage[],
  projectName: string
): Promise<string> {
  if (!isAiConfigured()) {
    return (
      `AI responses aren't enabled yet for this workspace. ` +
      `Add an ANTHROPIC_API_KEY environment variable to turn on the AI architect for "${projectName}".`
    );
  }

  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: BUILDER_SYSTEM_PROMPT,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text ?? "I wasn't able to generate a response. Please try again.";
}

export type ProjectPlanData = {
  summary: string;
  features: { title: string; description: string }[];
  dataModel: {
    name: string;
    fields: { name: string; type: string; description?: string }[];
  }[];
  buildSteps: string[];
};

const PLAN_SYSTEM_PROMPT = `You are the AI software architect inside an AI-powered app-building platform.
Given a conversation where a user describes an application they want built, produce a concrete,
implementable project plan by calling the save_project_plan tool. Keep it grounded in what was
actually discussed — do not invent unrelated features. Aim for 3-7 features, a data model with the
core entities only, and 4-8 build steps in a sensible order.`;

const PLAN_TOOL: Anthropic.Tool = {
  name: "save_project_plan",
  description: "Save a structured project plan derived from the conversation so far.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "A 1-3 sentence summary of what the app does.",
      },
      features: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["title", "description"],
        },
      },
      dataModel: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Entity name, e.g. Habit" },
            fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                },
                required: ["name", "type"],
              },
            },
          },
          required: ["name", "fields"],
        },
      },
      buildSteps: {
        type: "array",
        items: { type: "string" },
        description: "Ordered, high-level build steps.",
      },
    },
    required: ["summary", "features", "dataModel", "buildSteps"],
  },
};

export async function generateProjectPlan(
  history: BuilderMessage[],
  projectName: string
): Promise<ProjectPlanData | null> {
  if (!isAiConfigured() || history.length === 0) return null;

  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    system: PLAN_SYSTEM_PROMPT,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user" as const,
        content: `Save the current best project plan for "${projectName}" using the save_project_plan tool.`,
      },
    ],
    tools: [PLAN_TOOL],
    tool_choice: { type: "tool", name: "save_project_plan" },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) return null;
  return toolUse.input as ProjectPlanData;
}

export type GeneratedFile = { path: string; content: string };

const CODE_SYSTEM_PROMPT = `You are the AI developer inside an AI-powered app-building platform.
Given a project plan, generate a small, complete, working prototype by calling the
save_project_files tool. Hard requirements:
- Output a static, dependency-free prototype: exactly one "index.html" that links a
  "styles.css" and a "app.js", plus any other files only if truly necessary.
- No build step, no external CDNs, no frameworks — plain HTML, CSS, and vanilla JavaScript only.
- Implement the core features from the plan at a working, demo-able level. Use
  window.localStorage for persistence so the prototype is functional without a backend.
- Make it look clean and modern (system-ui font, reasonable spacing and color, responsive).
- Every file's content must be complete and immediately runnable — no placeholders like
  "// TODO: implement" for core functionality.`;

const CODE_TOOL: Anthropic.Tool = {
  name: "save_project_files",
  description: "Save the generated source files for the project prototype.",
  input_schema: {
    type: "object",
    properties: {
      files: {
        type: "array",
        items: {
          type: "object",
          properties: {
            path: { type: "string", description: 'e.g. "index.html", "styles.css", "app.js"' },
            content: { type: "string" },
          },
          required: ["path", "content"],
        },
      },
    },
    required: ["files"],
  },
};

export async function generateProjectFiles(
  plan: ProjectPlanData,
  projectName: string
): Promise<GeneratedFile[] | null> {
  if (!isAiConfigured()) return null;

  const anthropic = getClient();

  const planSummary = [
    `Project: ${projectName}`,
    `Summary: ${plan.summary}`,
    `Features: ${plan.features.map((f) => `${f.title} — ${f.description}`).join("; ")}`,
    `Data model: ${plan.dataModel
      .map((e) => `${e.name}(${e.fields.map((f) => `${f.name}: ${f.type}`).join(", ")})`)
      .join("; ")}`,
  ].join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 8192,
    system: CODE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate the prototype for this plan using the save_project_files tool:\n\n${planSummary}`,
      },
    ],
    tools: [CODE_TOOL],
    tool_choice: { type: "tool", name: "save_project_files" },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) return null;
  const input = toolUse.input as { files: GeneratedFile[] };
  return input.files;
}
