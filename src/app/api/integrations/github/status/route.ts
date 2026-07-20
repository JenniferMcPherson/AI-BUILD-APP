import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { isGithubConfigured } from "@/lib/github";

export async function GET() {
  const { userId } = await verifySession();

  const account = await db.account.findFirst({
    where: { userId, provider: "github" },
    select: { providerAccountId: true },
  });

  return NextResponse.json({
    configured: isGithubConfigured(),
    connected: Boolean(account),
  });
}
