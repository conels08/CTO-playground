# Quit Smoking Tracker

A modern web application built with Next.js 16, TypeScript, and Tailwind CSS. This project demonstrates a complete quit smoking tracking system with backend API, database persistence, and real-time progress monitoring.

## Features

- ⚡ **Next.js 16** - App Router with React Server Components
- 📘 **TypeScript** - Type-safe development experience
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **Component Library** - Reusable UI components (Button, Card, Navigation, Footer)
- 🛠️ **Utility Functions** - Date, math, and localStorage helpers
- 📊 **Seed Data** - Health facts, milestones, and motivational quotes
- 🗄️ **Backend API** - Next.js Route Handlers with Prisma ORM
- 🗃️ **Database** - SQLite with Prisma for local development
- 📈 **Progress Tracking** - Days quit, cigarettes avoided, money saved
- 🎯 **Milestones** - Achievement tracking with health benefits
- 📝 **Daily Check-ins** - Track cravings, mood, and notes
- ✨ **Code Quality** - ESLint and Prettier for consistent code

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** SQLite with Prisma ORM
- **API:** Next.js Route Handlers
- **Authentication:** Simple demo user (easily extendable)
- **Linting:** ESLint
- **Formatting:** Prettier
- **Package Manager:** npm / pnpm

## Project Structure

```
.
├── app/                      # Next.js app router
│   ├── layout.tsx           # Root layout with navigation
│   ├── page.tsx             # Home page
│   ├── about/               # About page
│   ├── dashboard/           # Dashboard page
│   ├── onboarding/          # Onboarding flow
│   └── api/                 # API Route Handlers
│       ├── quit-profile/    # Quit profile endpoints
│       ├── checkins/        # Daily check-in endpoints
│       └── progress/        # Progress calculation endpoints
├── components/              # React components
│   ├── layout/              # Layout components
│   │   ├── Navigation.tsx   # Navigation bar
│   │   └── Footer.tsx       # Footer
│   └── ui/                  # UI components
│       ├── Button.tsx       # Button component
│       └── Card.tsx         # Card component
├── lib/                     # Shared libraries
│   ├── data/                # Seed data
│   │   ├── healthFacts.json
│   │   ├── milestones.json
│   │   ├── motivationalQuotes.json
│   │   ├── types.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── date.ts          # Date utilities
│   │   ├── math.ts          # Math utilities
│   │   ├── localStorage.ts  # localStorage helpers
│   │   └── index.ts
│   ├── db.ts               # Prisma client setup
│   └── api-utils.ts         # Backend utility functions
├── prisma/                  # Database configuration
│   ├── schema.prisma       # Database schema
│   ├── .env                # Environment variables
│   ├── seed.ts             # Database seeding script
│   └── migrations/         # Database migrations
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cto-playground
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed the database with sample data
npm run db:seed
```

4. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### First Time Setup

1. Navigate to `/onboarding` to set up your quit profile
2. Fill in your quit date, smoking history, and goals
3. Start tracking your progress on the dashboard!
4. Make daily check-ins to track your cravings and mood

### Database Reset (Development)

To reset the database during development:

```bash
# Reset database and run fresh migrations
npm run db:reset

# Then reseed if needed
npm run db:seed
```

### Available Scripts

#### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

#### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

#### Database Management
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:reset` - Reset database and run fresh migrations
- `npm run db:studio` - Open Prisma Studio for database visualization
- `npm run db:seed` - Seed database with sample data

## API Endpoints

The application provides RESTful API endpoints for managing quit smoking data:

### Quit Profile Management

**GET /api/quit-profile**
- Fetch the current user's quit profile
- Returns: Quit profile data with computed statistics

**POST /api/quit-profile**
- Create or update the user's quit profile
- Body: Quit profile form data
- Returns: Updated quit profile with statistics

### Daily Check-ins

**GET /api/checkins**
- Fetch daily check-ins for the current user
- Query parameters: `from`, `to` for date filtering
- Returns: Array of check-in records

**POST /api/checkins**
- Create a new daily check-in
- Body: Date, craving intensity (1-10), mood, notes
- Returns: Created check-in record

### Progress Tracking

**GET /api/progress**
- Fetch computed progress statistics
- Returns: Days quit, cigarettes avoided, money saved, milestones, health snapshot

## Database Schema

### User Model
- `id` (String, Primary Key)
- `email` (String, Optional)
- `createdAt` (DateTime)

### QuitProfile Model
- `id` (String, Primary Key)
- `userId` (String, Foreign Key)
- `quitDate` (DateTime)
- `cigarettesPerDay` (Integer)
- `costPerPack` (Float)
- `cigarettesPerPack` (Integer, default: 20)
- `personalGoal` (String, Optional)

### DailyCheckIn Model
- `id` (String, Primary Key)
- `userId` (String, Foreign Key)
- `date` (DateTime)
- `cravingIntensity` (Integer, 1-10)
- `mood` (String)
- `notes` (String, Optional)

## Features Guide

### Onboarding Flow
1. New users are guided through setting up their quit profile
2. Collect quit date, smoking habits, and personal goals
3. Redirect to dashboard after completion

### Dashboard Tracking
- **Real-time Progress**: Days smoke-free, cigarettes avoided, money saved
- **Health Milestones**: Visual achievement tracking with health benefits
- **Daily Check-ins**: Track cravings, mood, and personal notes
- **Motivational Messages**: Dynamic messages based on progress

### Progress Calculations
- **Days Since Quit**: Calculated from quit date to present
- **Cigarettes Avoided**: Days quit × cigarettes per day
- **Money Saved**: (Days quit × cigarettes per day / cigarettes per pack) × cost per pack
- **Milestones**: Automatic detection of achievement milestones

## Utilities

### Date Utilities (`lib/utils/date.ts`)

- `formatDate(date)` - Format date in long format
- `formatDateShort(date)` - Format date in short format
- `getDaysDifference(date1, date2)` - Calculate days between two dates
- `addDays(date, days)` - Add days to a date
- `isToday(date)` - Check if date is today
- `getWeekNumber(date)` - Get week number of the year

### Math Utilities (`lib/utils/math.ts`)

- `clamp(value, min, max)` - Clamp value between min and max
- `roundToDecimal(value, decimals)` - Round to specific decimal places
- `calculatePercentage(value, total)` - Calculate percentage
- `getAverage(numbers)` - Get average of array
- `getMedian(numbers)` - Get median of array
- `calculateBMI(weightKg, heightCm)` - Calculate BMI
- `randomInRange(min, max)` - Generate random number in range

### LocalStorage Utilities (`lib/utils/localStorage.ts`)

- `setItem(key, value)` - Save item to localStorage
- `getItem(key, defaultValue)` - Get item from localStorage
- `removeItem(key)` - Remove item from localStorage
- `clear()` - Clear all localStorage
- `hasItem(key)` - Check if item exists

## Seed Data

The project includes seed data for:

- **Health Facts** - 10 health-related facts with categories
- **Milestones** - 10 achievement milestones with icons and thresholds
- **Motivational Quotes** - 15 inspirational quotes

Access the data through `lib/data/index.ts`:

```typescript
import { healthFacts, milestones, motivationalQuotes } from "@/lib/data";
```

## Components

### UI Components

- **Button** - Customizable button with variants (primary, secondary, outline) and sizes
- **Card** - Container component with optional title

### Layout Components

- **Navigation** - Responsive navigation bar with active link highlighting
- **Footer** - Simple footer with copyright information

## Development

### Code Style

This project uses ESLint and Prettier for consistent code quality. Run the following commands:

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Building for Production

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT
