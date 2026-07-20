import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { verifySession } from "@/lib/dal";
import { getGithubAuthorizeUrl, isGithubConfigured } from "@/lib/github";

export async function GET(req: NextRequest) {
  await verifySession();

  if (!isGithubConfigured()) {
    return NextResponse.json(
      { error: "GitHub export isn't configured yet. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET." },
      { status: 501 }
    );
  }

  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/dashboard";
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("github_oauth_return_to", returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(getGithubAuthorizeUrl(state));
}
