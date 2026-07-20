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
