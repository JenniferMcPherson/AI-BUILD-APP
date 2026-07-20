import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySession } from "@/lib/dal";
import { exchangeCodeForToken, getGithubUser } from "@/lib/github";

export async function GET(req: NextRequest) {
  const { userId } = await verifySession();

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("github_oauth_state")?.value;
  const returnTo = cookieStore.get("github_oauth_return_to")?.value ?? "/dashboard";
  cookieStore.delete("github_oauth_state");
  cookieStore.delete("github_oauth_return_to");

  const failUrl = new URL(returnTo, req.nextUrl.origin);

  if (!code || !state || state !== expectedState) {
    failUrl.searchParams.set("github_error", "Something went wrong connecting GitHub. Please try again.");
    return NextResponse.redirect(failUrl);
  }

  const accessToken = await exchangeCodeForToken(code);
  if (!accessToken) {
    failUrl.searchParams.set("github_error", "GitHub didn't authorize the connection. Please try again.");
    return NextResponse.redirect(failUrl);
  }

  const githubUser = await getGithubUser(accessToken);
  if (!githubUser) {
    failUrl.searchParams.set("github_error", "Couldn't read your GitHub profile. Please try again.");
    return NextResponse.redirect(failUrl);
  }

  await db.account.upsert({
    where: {
      provider_providerAccountId: { provider: "github", providerAccountId: String(githubUser.id) },
    },
    create: {
      provider: "github",
      providerAccountId: String(githubUser.id),
      accessToken,
      userId,
    },
    update: { accessToken },
  });

  const successUrl = new URL(returnTo, req.nextUrl.origin);
  successUrl.searchParams.set("github_connected", "1");
  return NextResponse.redirect(successUrl);
}
