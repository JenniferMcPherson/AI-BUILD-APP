# Forge

Forge is the foundation of an AI-powered software creation platform: describe an app in
plain English and Forge plans, builds, tests, and (eventually) deploys it.

This repository currently contains the **platform foundation**: authentication, the
dashboard, project workspaces, and the AI builder chat interface. Later phases will add
live preview, code generation, deployment, billing, community, and the marketplace.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend:** Next.js Route Handlers + Server Actions, Node.js
- **Database:** PostgreSQL via Prisma ORM 7
- **Auth:** Custom stateless session auth (bcrypt password hashing + signed JWT session
  cookies), following the [official Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)
- **AI:** Anthropic Claude via `@anthropic-ai/sdk`

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

- `DATABASE_URL` — a PostgreSQL connection string.
- `SESSION_SECRET` — generate with `openssl rand -base64 32`.
- `ANTHROPIC_API_KEY` — optional. Without it, the AI builder chat still works end-to-end
  (messages persist, UI is fully functional) but responds with a message explaining that
  AI responses aren't enabled yet, instead of a real model reply.

### 3. Set up the database

```bash
npx prisma migrate dev
```

This creates the `users`, `accounts`, `projects`, and `messages` tables.

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Project structure

```
prisma/schema.prisma        Database schema (User, Account, Project, Message)
src/proxy.ts                 Route protection (Next.js 16's renamed Middleware)
src/lib/
  db.ts                      Prisma client singleton (pg driver adapter)
  session.ts                 JWT session cookie encrypt/decrypt/create/delete
  dal.ts                     Data Access Layer — verifySession(), getCurrentUser()
  password.ts                bcrypt hashing
  ai.ts                      Anthropic client wrapper for the AI builder
  validations.ts             Zod schemas for forms
src/app/
  page.tsx                   Marketing landing page
  (auth)/login, register     Auth pages (Server Actions: src/app/actions/auth.ts)
  (dashboard)/dashboard      Protected dashboard — lists a user's projects
  (dashboard)/projects/[id]  Project workspace — AI builder chat
  api/projects/[id]/messages AI builder chat API route
src/components/
  ui/                        Design system primitives (Button, Card, Dialog, ...)
  dashboard/                 Sidebar, Topbar, New Project dialog
  workspace/                 AI builder chat UI
```

## Design decisions worth knowing

- **Sessions are stateless JWTs in an httpOnly cookie**, not a third-party auth library.
  This keeps the auth stack dependency-free and fully under our control while we're still
  early; the `Account` model already exists in the schema so OAuth providers (Google,
  GitHub, etc.) can be added later without a migration.
- **`proxy.ts`** is Next.js 16's renamed `middleware.ts` — it performs optimistic route
  protection (redirects unauthenticated users away from `/dashboard` and `/projects/*`,
  and authenticated users away from `/login` and `/register`). Actual authorization is
  re-checked in the Data Access Layer (`verifySession`) on every protected page and API
  route, per Next.js's recommended defense-in-depth pattern.
- **The AI builder never throws when `ANTHROPIC_API_KEY` is unset.** It's a real,
  persisted chat (backed by the `Message` table) from day one; only the model call itself
  is stubbed out until a key is configured.

## Scripts

```bash
npm run dev         # start the dev server
npm run build        # production build
npm run lint          # eslint
npm run db:migrate   # prisma migrate dev
npm run db:studio    # prisma studio (browse the database)
```

## What's next

See the project owner for the approved roadmap. Planned next steps, in order:
1. Live project preview + code generation
2. GitHub / ZIP / hosted-URL export
3. Billing (Free / Pro / Business / Enterprise plans)
4. Community (creator profiles, discovery, marketplace)
5. Educational library
