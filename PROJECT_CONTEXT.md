# Project Context

## Product Goal

- Build a **production-ready smoke-cessation tracking web app** that supports both demo (unauthenticated) and authenticated users.
- Allow users to track quit progress, daily check-ins, cravings, mood, milestones, and motivation.
- Capture **consented email opt-ins** for product updates with attribution (UTM/referrer/landing path), synced to Kit.
- Long-term goal: monetize via traffic (**non-invasive ads**, affiliate links, newsletter/email list opt-in) and treat this as a learning foundation for future scalable apps.

## Users / Use Cases

- **Unauthenticated (Demo) users**
  - Can view dashboard, progress, and check-ins populated with sample/demo data.
  - Cannot write or persist data.
  - Shown a clear demo banner encouraging sign-in.
- **Authenticated users**
  - Can create an account, log in, and remain logged in via NextAuth.
  - Can create and view real daily check-ins.
  - Can create a quit profile and view personalized progress metrics.
  - Data is user-scoped and protected.
- **Visitors (Email opt-in)**
  - Can submit an email with explicit consent for updates.
  - Email is stored in `EmailSubscriber` and optionally synced to Kit.

## Current Architecture

- **Frontend:**
  - Next.js (App Router) with TypeScript + Tailwind CSS
  - Client components for interactive pages (`"use client"`)
  - Demo mode determined via NextAuth client session:
    - `const { status } = useSession();`
    - `const isDemo = status !== "authenticated";`
- Homepage includes `components/marketing/EmailSignup` with opt-in + attribution capture
  - About page includes `components/SupportThisProject` with PayPal donate form

- **Backend:**
  - Next.js route handlers (`app/api/**/route.ts`)
  - Prisma ORM for database access
  - API routes return JSON with `{ success: boolean, data?: any, message?: string }` patterns (keep consistent)
  - `/api/subscribe` validates email + consent, stores to Postgres, and best-effort syncs to Kit

- **Auth:**
  - NextAuth v4 (`next-auth@4.24.13`)
  - Credentials provider backed by the `User` table
  - Custom sign-in page at `/auth/signin`, sign-up page at `/auth/signup`
  - Passwords are SHA-256 hashed in `lib/auth.ts` (ok for playground, not production)
  - Legacy cookie-based login/logout endpoints exist (`/api/auth/login`, `/api/auth/logout`) but UI uses NextAuth

- **Data storage:**
  - Prisma models include: `User`, `QuitProfile`, `DailyCheckIn`, `EmailSubscriber`
  - Relations:
    - `User` ↔ `QuitProfile` (1:1)
    - `User` ↔ `DailyCheckIn` (1:many)
  - Data is always user-scoped using `getCurrentUserId()`

- **Hosting/deploy:**
  - Supabase Postgres as the production DB
  - App deployment target is still TBD (Netlify/Vercel are likely candidates)
  - Environment variables required in production (hosting provider dashboard), **not** local `.env.local`

## Key Constraints

- **Don’t break what’s already working.** Prefer minimal, safe changes.
- **Demo mode must never persist data** or allow protected endpoints to be used without auth.
- **Authenticated endpoints must enforce auth** (return 401 if not signed in).
- **Email opt-in must require explicit consent** and store in DB even if Kit is down.
- **Avoid `any`** where possible. ESLint is strict and flags `@typescript-eslint/no-explicit-any`.
- **ESLint must pass** (or warnings must be intentionally handled case-by-case).
- **Cost-conscious**: start on free tiers and keep infra minimal.
- **Monetization** later must be non-invasive:
  - Ads/affiliates should not degrade UX
  - Email list/newsletter must be opt-in and compliant

## Current Milestone

- Working local app with:
  - NextAuth installed/configured and a custom sign-in page at `/auth/signin`
  - Sign-up flow via `/auth/signup` and `/api/auth/signup`
  - Demo-mode banners on dashboard and check-ins
  - Check-ins page supports demo sample data when not authenticated
  - Supabase Postgres connected and migrations applied
  - Email opt-in capture on the homepage with DB persistence + Kit sync

## Next 3 Tasks

1. Decide on production-ready auth and password hashing (e.g., bcrypt or OAuth).
2. Configure production env vars and deploy (Netlify/Vercel + Supabase).
3. Add analytics/monitoring (Sentry + Plausible/PostHog).

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
- **Email subscribe**
  - Email must be valid and consent is required
  - Store to `EmailSubscriber` first; Kit sync is best-effort
  - Persist attribution (utm/referrer/landing path) when provided

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
- `app/auth/signin/SignInClient.tsx`
  - Credentials sign-in form with friendly error messages
- `app/auth/signup/SignupClient.tsx`
  - Sign-up flow that calls `/api/auth/signup` then signs in
- `app/api/subscribe/route.ts`
  - Validates email + consent, stores `EmailSubscriber`, syncs to Kit
- `components/marketing/EmailSignup.tsx`
  - Homepage opt-in form with attribution capture
- `components/SupportThisProject.tsx`
  - About page PayPal donate form (linked from the footer)
- `lib/api-utils.ts`
  - Helper functions (`getCurrentUserId`, date formatting, calculations)
- `lib/db.ts`
  - Prisma client using Postgres adapter + shared pg pool
- `prisma.config.ts`
  - Prisma v7 datasource config (reads `.env`/`.env.local`)

## Environment Variables (Local vs Production)

- Local dev uses `.env.local` and includes at minimum:
  - `NEXTAUTH_URL=http://localhost:3000`
  - `NEXTAUTH_SECRET=<openssl rand -base64 32>`
  - `DATABASE_URL=<Supabase pooler URL>` (no quotes; port 6543)
  - `DIRECT_URL=<Supabase direct URL>` (no quotes; port 5432, used for migrations)
  - `SHADOW_DATABASE_URL=<shadow DB URL>` (optional; needed when running `prisma migrate dev`)
  - `KIT_API_KEY=<Kit API key>` (optional; used by `/api/subscribe`)
- Production will require setting env vars in the hosting provider (not in repo).
- `.env.local` should not be committed.
- Repo hygiene: `.env*` files are ignored and a full history scan reports no secrets.

## Lint/Tooling Notes

- Keep `npm run lint` passing; address new warnings as they appear.

## Deployment Notes / Expectations

- This is not a “vanilla static site.”
- It includes:
  - Server routes (`app/api/*`)
  - NextAuth
  - Prisma + database
  - Email capture (optional Kit sync)
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
- Deployment will be real (Supabase Postgres + Netlify/Vercel), so keep env vars, migrations, and production constraints in mind.
- Prefer minimal, incremental changes; no big refactors without explicit confirmation.

## Glossary (optional)

- **Demo mode**: `status !== "authenticated"`; show sample data only.
- **Quit profile**: user’s quit date + smoking baseline used to compute stats.
- **Check-in**: daily record of cravings/mood/notes.
- **Milestones**: achievements unlocked over time; must be safe-array in responses.
- **Prisma**: ORM used for DB access and migrations.
- **NextAuth**: auth layer handling sessions, sign-in page routing, credentials provider.
- **Kit**: email service used for subscriber sync.

## Ongoing Notes for Persistence & AI Understanding

- (THE FOLLOWING CONTENT IS MEANT TO ACT AS A GENERAL RECORD KEEPER
  SOLELY FOR CHATGPT TO UNDERSTAND THE CHANGES THAT HAVE HAPPENED BECAUSE MEMORY MAY NOT PERSIST AFTER CLOSING AND RELOADING VS CODE. THESE NOTES ALLOW CHAT TO UNDERSTAND WHAT IT MAY HAVE DONE IN A PREVIOUS SESSION.)
- Prisma uses Supabase Postgres with a pooler URL for `DATABASE_URL` (port 6543) so local Wi-Fi works; `DIRECT_URL` and `SHADOW_DATABASE_URL` use the direct connection (port 5432) for migrations only. `prisma/schema.prisma` includes `engineType = "binary"`. `lib/db.ts` uses Prisma’s Postgres driver adapter (`@prisma/adapter-pg` + `pg`) with a shared `Pool`.
- Prisma 7 uses `prisma.config.ts` for datasource URLs; `prisma/schema.prisma` should not define `url`. `lib/db.ts` uses Prisma’s Postgres driver adapter (`@prisma/adapter-pg`) and relies on `.env.local` for URLs. Keep `.env.local` unquoted.
- Prisma provider is `postgresql` for Supabase-first development.
- Existing SQLite migrations are not compatible with Postgres; recreate migrations when switching providers.
- Added demo-mode onboarding flow: `/onboarding` now stores a local demo profile in `localStorage` when unauthenticated and routes to `/dashboard`, while authenticated users still save via `/api/quit-profile`. Dashboard now reads that local demo profile and renders computed stats instead of only sample data, and displays whether demo data is local or sample.
- Switched `getCurrentUserId` to rely on NextAuth session (email) instead of cookie sessionToken; updated `/api/quit-profile`, `/api/progress`, and `/api/checkins` to pass the session for user scoping.
- Sign-in page devtools may show failed requests for extension-injected scripts; these are browser extension artifacts, not app errors.
- Added explicit request-body validation for quit profile and check-ins to return clean 400s instead of 500s.
- Added baseline security headers in `next.config.ts` (no CSP to avoid asset breakage in dev).
- Local dev latency can be higher when using a remote Supabase DB (especially on a hotspot); consider caching or loading states.
- VS Code Prisma extension should use the project CLI: set `prisma.prismaPath` to `node_modules/.bin/prisma` and reload the window to avoid false schema diagnostics.
- Added email opt-in capture on the homepage, persisting to `EmailSubscriber` with consent and attribution, with best-effort Kit sync via `/api/subscribe`.
