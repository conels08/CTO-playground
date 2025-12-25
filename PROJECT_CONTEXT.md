# Project Context

## Product Goal

- Build a **production-ready smoke-cessation tracking web app** that supports both demo (unauthenticated) and authenticated users.
- Allow users to track quit progress, daily check-ins, cravings, mood, milestones, and motivation.
- Support **real user data persistence** once authenticated, while allowing **safe demo exploration** for unauthenticated visitors.
- Long-term goal: monetize via traffic (**non-invasive ads**, affiliate links, newsletter/email list opt-in) and treat this as a learning foundation for future scalable apps.

## Users / Use Cases

- **Unauthenticated (Demo) users**
  - Can view dashboard, progress, and check-ins populated with sample/demo data.
  - Cannot write or persist data.
  - Shown a clear demo banner encouraging sign-in.
- **Authenticated users**
  - Can create an account, log in, and remain logged in via secure cookies.
  - Can create and view real daily check-ins.
  - Can create a quit profile and view personalized progress metrics.
  - Data is user-scoped and protected.

## Current Architecture

- **Frontend:**
  - Next.js (App Router)
  - TypeScript + TSX
  - Tailwind CSS
  - Client components for interactive pages (`"use client"`)
  - Demo mode determined via NextAuth client session:
    - `const { status } = useSession();`
    - `const isDemo = status !== "authenticated";`
  - Demo UI includes a banner/card (orange theme) to explain demo mode and prompt sign-in.

- **Backend:**
  - Next.js route handlers (`app/api/**/route.ts`)
  - Prisma ORM for database access
  - API routes return JSON with `{ success: boolean, data?: any, message?: string }` patterns (keep consistent)

- **Auth:**
  - NextAuth v4 (`next-auth@4.24.13`)
  - Credentials provider (dev/local credentials) + custom sign-in page:
    - NextAuth pages config: `pages: { signIn: "/auth/signin" }`
  - Session strategy: JWT (`session: { strategy: "jwt" }`)
  - Navigation uses `useSession()` and shows `Sign in` / `Sign out`.
  - Sign-out behavior was adjusted to redirect home after sign-out (avoid staying on dashboard).

- **Data storage:**
  - Prisma models include (at minimum): `User`, `QuitProfile`, `DailyCheckIn`
  - Relations:
    - `User` ↔ `QuitProfile` (1:1)
    - `User` ↔ `DailyCheckIn` (1:many)
  - Data is always user-scoped using `getCurrentUserId()`.

- **Hosting/deploy:**
  - Planned: Supabase Postgres (free tier) as the production DB.
  - Planned deploy target: Netlify (free tier) for Next.js app (with serverless functions).
  - Environment variables required in production (Netlify/Supabase dashboard), **not** local `.env.local`.

## Key Constraints

- **Don’t break what’s already working.** Prefer minimal, safe changes.
- **Demo mode must never persist data** or allow protected endpoints to be used without auth.
- **Authenticated endpoints must enforce auth** (return 401 if not signed in).
- **Avoid `any`** where possible. ESLint is strict and flags `@typescript-eslint/no-explicit-any`.
- **ESLint must pass** (or warnings must be intentionally handled case-by-case).
- **Cost-conscious**: start on free tiers and keep infra minimal.
- **Monetization** later must be non-invasive:
  - Ads/affiliates should not degrade UX
  - Email list/newsletter must be opt-in and compliant

## Current Milestone

- Working local app with:
  - NextAuth installed/configured and a custom sign-in page at `/auth/signin`
  - Credentials sign-in works (using `.env.local` creds for dev)
  - Sign out works and redirects properly
  - Demo-mode banners on dashboard and check-ins
  - Check-ins page supports demo sample data when not authenticated
- Tooling changes:
  - VS Code extensions installed: ESLint, Tailwind CSS IntelliSense, Prisma
  - These surfaced lint/type issues that previously weren’t visible
- Current blocker:
  - `npm run lint` fails due to **3 ESLint errors** in `lib/api-utils.ts` (explicit `any` usage)
  - Several warnings (unused vars / hook dependency / unused eslint-disable)

## Next 3 Tasks

1. Fix remaining ESLint **errors** in `lib/api-utils.ts` by replacing `any` with explicit types (highest priority because lint fails).
2. Clean up remaining ESLint **warnings** in:
   - `app/api/quit-profile/route.ts` (unused `_request`)
   - `app/check-ins/page.tsx` (hook dependency warning)
   - `app/dashboard/page.tsx` (unused eslint-disable)
3. Production readiness + deployment:
   - Set up Supabase Postgres + Prisma migrations
   - Configure Netlify env vars (NextAuth secrets, DB URL)
   - Verify demo/auth behavior in production

## Domain Rules / Edge Cases

- **Authentication**
  - Protected API routes (`/api/progress`, `/api/checkins`, etc.) should return:
    - `401 Unauthorized` when no session exists
  - Demo users should never hit these protected routes in a way that breaks UI.
- **Progress/quit-profile**
  - If a user has no quit profile:
    - progress endpoint returns safe defaults (0 values, safe milestoneStatuses array)
    - UI should not crash (no `.map()` on undefined)
- **Check-ins**
  - One check-in per user per date (handle duplicate create with `409`)
  - Date cannot be in the future
  - Craving intensity must be 1–10
- **Milestones**
  - `milestoneStatuses` must always be an array (never null/undefined)
- **Demo mode behavior**
  - Demo mode uses sample in-memory data (never DB)
  - Should show a banner explaining demo + CTA to sign in
  - When switching from demo → auth, pages should start fetching real data

## Important Files / What They Do

- `app/dashboard/page.tsx`
  - Client page
  - Fetches `/api/progress`, `/api/quit-profile`, `/api/checkins`
  - Shows demo banner when `isDemo === true`
- `app/check-ins/page.tsx`
  - Client page
  - In demo mode: uses local `demoCheckIns`
  - In auth mode: fetches `/api/checkins`
  - Shows demo banner when `isDemo === true`
- `app/api/auth/[...nextauth]/route.ts`
  - NextAuth handler (CredentialsProvider)
  - `pages.signIn = "/auth/signin"`
- `app/api/progress/route.ts`
  - Uses `getServerSession(authOptions)` and returns 401 when not signed in
  - Returns safe defaults if no quitProfile
- `app/api/checkins/route.ts`
  - Uses `getServerSession(authOptions)` and returns 401 when not signed in
  - GET supports optional date range (`from`, `to`)
  - POST creates check-in and handles duplicates
- `lib/api-utils.ts`
  - Contains helper functions (`getCurrentUserId`, date formatting, calculations)
  - Currently contains `any` types causing lint failure

## Environment Variables (Local vs Production)

- Local dev uses `.env.local` and includes at minimum:
  - `NEXTAUTH_URL=http://localhost:3000`
  - `NEXTAUTH_SECRET=<openssl rand -base64 32>`
  - Credentials for dev auth (if using credentials provider):
    - `AUTH_USER=...`
    - `AUTH_PASS=...`
- Production will require setting env vars in Netlify (not in repo).
- `.env.local` should not be committed.

## Lint/Tooling Notes

- After enabling ESLint extension, errors surfaced that were already present.
- Current `npm run lint` output (summary):
  - Warnings:
    - unused `_request` in quit-profile route
    - missing hook dep in check-ins page
    - unused eslint-disable in dashboard page
  - Errors:
    - `lib/api-utils.ts` uses explicit `any` three times
- Fix errors first (lint must pass), then handle warnings.

## Deployment Notes / Expectations

- This is not a “vanilla static site.”
- It includes:
  - Server routes (`app/api/*`)
  - NextAuth
  - Prisma + database
- Deployment requires:
  - A real hosted Postgres DB (Supabase)
  - Environment variables configured in hosting provider
  - Prisma migrations applied to production DB
- Free tier should be sufficient for early traffic and testing, but monitor limits.

## Assistant Reminder (Progress Prompt)

- This started as a CTO.new scaffold but is now a real product-in-progress intended to generate revenue.
- Treat every change as production-bound: prioritize safety, auth integrity, and data persistence.
- Demo mode must remain non-persistent; authenticated mode must be real and secure.
- Monetization is planned via non-invasive ads (AdSense) and affiliate links, so UX and trust matter.
- Deployment will be real (Supabase Postgres + Netlify), so keep env vars, migrations, and production constraints in mind.
- Prefer minimal, incremental changes; no big refactors without explicit confirmation.

## Glossary (optional)

- **Demo mode**: `status !== "authenticated"`; show sample data only.
- **Quit profile**: user’s quit date + smoking baseline used to compute stats.
- **Check-in**: daily record of cravings/mood/notes.
- **Milestones**: achievements unlocked over time; must be safe-array in responses.
- **Prisma**: ORM used for DB access and migrations.
- **NextAuth**: auth layer handling sessions, sign-in page routing, credentials provider.

## Ongoing Notes for Persistence & AI Understanding

- (THE FOLLOWING CONTENT IS MEANT TO ACT AS A GENERAL RECORD KEEPER
  SOLELY FOR CHATGPT TO UNDERSTAND THE CHANGES THAT HAVE HAPPENED BECAUSE MEMORY MAY NOT PERSIST AFTER CLOSING AND RELOADING VS CODE. THESE NOTES ALLOW CHAT TO UNDERSTAND WHAT IT MAY HAVE DONE IN A PREVIOUS SESSION.)
- Prisma schema squiggles were due to the VS Code Prisma extension using Prisma 7 rules; this project uses Prisma 5.15.1, where `datasource db { url = "file:./dev.db" }` is valid. Set `prisma.prismaPath` to `node_modules/.bin/prisma` so the extension uses the local CLI and stops flagging `url` as invalid.
- Updated to Prisma 7 config flow: moved datasource URL to `prisma.config.ts`, removed `url` from `prisma/schema.prisma`, added SQLite adapter usage in `lib/db.ts` and `prisma/seed.ts`, and created migration `20251224132739_update_schema`. Also cleaned ESLint issues (unused param + eslint-disable) and removed `any` types in auth/checkins/progress routes; commits were pushed.
- Added demo-mode onboarding flow: `/onboarding` now stores a local demo profile in `localStorage` when unauthenticated and routes to `/dashboard`, while authenticated users still save via `/api/quit-profile`. Dashboard now reads that local demo profile and renders computed stats instead of only sample data, and displays whether demo data is local or sample.
- Switched `getCurrentUserId` to rely on NextAuth session (email) instead of cookie sessionToken; updated `/api/quit-profile`, `/api/progress`, and `/api/checkins` to pass the session for user scoping.
- `lib/db.ts` now chooses the SQLite adapter only when `DATABASE_URL` is empty or file-based, otherwise uses standard PrismaClient for Postgres (Supabase-ready).
- Enabled Prisma `driverAdapters` preview feature for Prisma 7 + SQLite adapter, and added a local `better-sqlite3.d.ts` to silence missing type errors in TS.
