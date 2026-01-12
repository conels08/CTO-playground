# Quit Smoking Tracker

A quit-smoking tracker built with Next.js 16, TypeScript, Tailwind CSS, and Prisma/Postgres. The app supports demo exploration, authenticated tracking, and an opt-in email signup flow that syncs to Kit.

## Features

- ⚡ **Next.js 16 + React 19** - App Router with server components
- 📘 **TypeScript** - Type-safe UI and API routes
- 🎨 **Tailwind CSS 4** - Utility-first styling
- 🔐 **Authentication** - NextAuth credentials + custom sign-in/sign-up flows
- 🗄️ **Postgres + Prisma** - User data, quit profiles, check-ins, and email subscribers
- 📈 **Progress Tracking** - Days quit, cigarettes avoided, money saved
- 📝 **Daily Check-ins** - Cravings, mood, and notes (one per day)
- 🧭 **Demo Mode** - Safe sample data for unauthenticated visitors
- 📬 **Email Opt-in** - Consent-gated signup with UTM/referrer attribution and Kit sync
- 💙 **Donations** - PayPal donate section on the About page with a footer link
- ✨ **Code Quality** - ESLint + Prettier

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** Postgres (Supabase) + Prisma 7
- **Auth:** NextAuth v4 credentials provider
- **Email:** Kit API (optional, best-effort)
- **Package Manager:** npm / pnpm

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── auth/               # NextAuth + signup/login/logout handlers
│   │   ├── checkins/
│   │   ├── progress/
│   │   ├── quit-profile/
│   │   └── subscribe/          # Email opt-in endpoint
│   ├── auth/                   # Sign-in/sign-up pages
│   ├── dashboard/
│   ├── check-ins/
│   ├── onboarding/
│   ├── about/
│   └── page.tsx                # Marketing homepage + email signup
├── components/
│   ├── marketing/              # EmailSignup component
│   ├── layout/
│   ├── providers/
│   └── ui/
├── lib/
│   ├── api-utils.ts
│   ├── auth.ts                 # Password hashing helpers
│   ├── db.ts                   # Prisma + Postgres adapter
│   └── data/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── prisma.config.ts
└── PROJECT_CONTEXT.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Postgres database (Supabase recommended)

### Installation

```bash
git clone <repository-url>
cd cto-playground
npm install
```

### Environment Variables

Create `.env.local` (or `.env`) with:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>

DATABASE_URL=<supabase pooler url>
DIRECT_URL=<supabase direct url>
# SHADOW_DATABASE_URL=<optional shadow db for prisma migrate dev>

# Optional: Kit integration for /api/subscribe
KIT_API_KEY=<kit api key>
```

### Database Setup

```bash
npm run db:generate
npm run db:migrate
npm run db:seed # optional
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Common Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run lint` - run ESLint
- `npm run type-check` - run TypeScript checks
- `npm run db:migrate` - apply migrations
- `npm run db:seed` - seed demo data

## Notes

- Demo users can explore the dashboard and check-ins without writing to the database.
- Email opt-ins are stored in Postgres and then synced to Kit on a best-effort basis.
- `lib/auth.ts` uses a simple SHA-256 hash for passwords (not production-grade).

## Repo Safety

- No secrets are committed; `.env*` files are ignored by default.
- A full history scan (TruffleHog) reports zero secrets.
