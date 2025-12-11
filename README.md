# CTO Playground

A modern web application built with Next.js 16, TypeScript, and Tailwind CSS. This project demonstrates best practices for structuring a scalable web application with reusable components, utility functions, and seed data.

## Features

- ⚡ **Next.js 16** - App Router with React Server Components
- 📘 **TypeScript** - Type-safe development experience
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **Component Library** - Reusable UI components (Button, Card, Navigation, Footer)
- 🛠️ **Utility Functions** - Date, math, and localStorage helpers
- 📊 **Seed Data** - Health facts, milestones, and motivational quotes
- ✨ **Code Quality** - ESLint and Prettier for consistent code

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
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
│   └── dashboard/           # Dashboard page
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
│   └── utils/               # Utility functions
│       ├── date.ts          # Date utilities
│       ├── math.ts          # Math utilities
│       ├── localStorage.ts  # localStorage helpers
│       └── index.ts
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

3. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

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
