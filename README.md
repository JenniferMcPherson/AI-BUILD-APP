# Forge

Forge is an AI-powered software creation platform: describe an app in plain English and
Forge plans it, builds a working prototype, lets you preview and iterate on it, and helps
you ship it — as a hosted URL, a GitHub repo, or a ZIP download.

## What's built

- **Auth** — email/password with bcrypt + signed JWT session cookies, defense-in-depth
  route protection (`proxy.ts` + a Data Access Layer checked on every protected route).
- **AI builder** — a per-project chat with an AI architect that turns a conversation into
  a structured plan (features, data model, build order), then an AI developer that
  generates a real HTML/CSS/JS prototype from that plan.
- **Workspace** — Builder (chat + plan), Code (file explorer + viewer + version history
  with restore), and Preview (live iframe) tabs for every project.
- **Exports** — ZIP download, a hosted URL (`/p/[slug]`) you can publish/unpublish, and
  push-to-GitHub via an OAuth App connection.
- **Billing** — Stripe subscriptions across Free/Pro/Business/Enterprise, a pricing page,
  a billing portal, and real plan-based project limits.
- **Community** — public creator profiles (`/u/[username]`), a Discover feed of published
  projects, a Marketplace (list, browse by category, star ratings/reviews, "use as
  template" cloning), and an educational Library (searchable articles with citations).
- **Growth** — a founder invite system (generate codes, invite-only signup mode via
  `INVITE_ONLY`), per-project view analytics on the dashboard, and SEO (`sitemap.xml`,
  `robots.txt`, per-page metadata).

Every AI/billing/GitHub integration follows the same contract: **without the relevant API
key configured, the feature degrades to a clear, non-crashing message instead of
erroring.** You can run and click through the entire app with zero external services
configured.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Next.js Route Handlers + Server Actions, Node.js
- **Database:** PostgreSQL via Prisma ORM 7
- **Auth:** Custom stateless session auth (bcrypt + signed JWT cookies), following the
  [official Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)
- **AI:** Anthropic Claude via `@anthropic-ai/sdk` (project plans + code generation use
  forced tool-use for structured output)
- **Billing:** Stripe (Checkout, Billing Portal, webhooks)
- **Other:** JSZip (ZIP export), GitHub REST API (OAuth App + Contents API)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

At minimum, set `DATABASE_URL` and `SESSION_SECRET` (generate with
`openssl rand -base64 32`). Everything else — `ANTHROPIC_API_KEY`,
`GITHUB_CLIENT_ID`/`SECRET`, `STRIPE_*` — is optional; see `.env.example` for what each
one unlocks and how the app behaves without it.

### 3. Set up the database

```bash
npm run db:migrate
```

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Project structure

```
prisma/schema.prisma          Database schema
src/proxy.ts                   Route protection (Next.js 16's renamed Middleware)
src/lib/
  db.ts, session.ts, dal.ts    Prisma client, JWT sessions, Data Access Layer
  ai.ts, plan.ts, files.ts     AI chat / plan generation / code generation
  stripe.ts, github.ts         Billing and GitHub integration helpers
  markdown.ts                  Dependency-free content format for Library articles
  invite.ts                    Founder invite code generation
src/app/
  page.tsx, pricing/, discover/, marketplace/, library/, u/[username]/
                                Public marketing + community pages
  (auth)/login, register       Auth pages
  (dashboard)/dashboard, projects/[id], settings
                                Protected app (project list, workspace, account settings)
  api/                         Route Handlers: AI chat/plan/files, exports, previews,
                                GitHub OAuth, Stripe webhook
  p/[slug]/[...path]           Public hosted-URL route for published projects
  sitemap.ts, robots.ts        SEO metadata routes
src/components/
  ui/                          Design system primitives (Button, Card, Dialog, ...)
  workspace/                   Chat, plan panel, code view, preview, export menu
  marketplace/, library/, settings/, billing/, dashboard/
```

## Design decisions worth knowing

- **Sessions are stateless JWTs in an httpOnly cookie**, not a third-party auth library —
  keeps the auth stack dependency-free while still early. The `Account` model already
  supports OAuth provider tokens (used today for GitHub export).
- **`proxy.ts`** is Next.js 16's renamed `middleware.ts`. It does optimistic route
  protection; real authorization is re-checked via the Data Access Layer
  (`verifySession`) on every protected page and API route.
- **Generated prototypes are static HTML/CSS/JS**, not full Next.js apps — this is what
  makes in-browser live preview, a same-origin hosted URL, and a plain ZIP export all
  possible without a build/sandbox execution service. `withBaseHref()` (`src/lib/html.ts`)
  makes relative asset links resolve correctly regardless of trailing slash.
- **Library article content** is a tiny non-Markdown format (blank-line paragraphs,
  `## heading`, `- bullet`, `**bold**`) parsed into blocks and rendered as React elements
  — never `dangerouslySetInnerHTML` — so user-authored content has no HTML-injection
  surface.
- **Every external integration degrades gracefully.** Missing `ANTHROPIC_API_KEY`,
  `STRIPE_SECRET_KEY`, or `GITHUB_CLIENT_ID` never throws — each surfaces a specific,
  actionable message in the UI instead.

## Scripts

```bash
npm run dev          # start the dev server
npm run build         # production build
npm run lint           # eslint
npm run db:migrate    # prisma migrate dev
npm run db:studio     # prisma studio (browse the database)
```
