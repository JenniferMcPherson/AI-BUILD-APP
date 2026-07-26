import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { CreatorInbox, type ThreadSummary } from "@/components/creator/creator-inbox";

export default async function CreatorMessagesPage() {
  const { userId } = await verifySession();

  const messages = await db.creatorMessage.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      projectId: true,
      senderId: true,
      body: true,
      createdAt: true,
      readAt: true,
      project: { select: { name: true, slug: true } },
      sender: { select: { name: true } },
    },
  });

  const threadOrder: string[] = [];
  const threadData = new Map<string, ThreadSummary>();
  const threadUnread = new Map<string, boolean>();

  for (const message of messages) {
    const key = `${message.projectId}:${message.senderId}`;
    if (!threadData.has(key)) {
      threadOrder.push(key);
      threadData.set(key, {
        projectId: message.projectId,
        projectName: message.project.name,
        projectSlug: message.project.slug,
        otherUserId: message.senderId,
        otherUserName: message.sender.name,
        lastMessage: message.body,
        lastMessageAt: message.createdAt.toLocaleString(),
        unread: false,
      });
      threadUnread.set(key, false);
    }
    if (message.readAt === null) threadUnread.set(key, true);
  }

  const threads = threadOrder.map((key) => ({
    ...threadData.get(key)!,
    unread: threadUnread.get(key) ?? false,
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted">Questions from people browsing your marketplace listings.</p>
      </div>

      <CreatorInbox threads={threads} />
    </div>
  );
}
