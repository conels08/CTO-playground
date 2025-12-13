import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getRandomHealthFact, getRandomQuote } from "@/lib/data";
import Link from "next/link";

// Check if user has a quit profile by attempting to fetch progress data
async function getQuitProfileStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/quit-profile`, {
      cache: 'no-cache'
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.success && result.data !== null;
    }
  } catch (error) {
    // If there's an error fetching, assume no profile exists
    console.log('Could not fetch quit profile:', error);
  }
  
  return false;
}

export default async function Home() {
  const healthFact = getRandomHealthFact();
  const quote = getRandomQuote();
  
  // Check if user has a quit profile
  const hasProfile = await getQuitProfileStatus();
  
  // Determine the destination for the "Get Started" button
  const getStartedHref = hasProfile ? "/dashboard" : "/onboarding";

  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to Your Smoke-Free Journey
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Track your days without cigarettes, unlock health milestones, and stay
            motivated with real health facts and inspirational quotes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card title="Health Fact of the Day">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">
                {healthFact.title}
              </h4>
              <p className="text-gray-600">{healthFact.fact}</p>
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                {healthFact.category}
              </span>
            </div>
          </Card>

          <Card title="Motivational Quote">
            <div className="space-y-2">
              <p className="text-gray-700 italic">&quot;{quote.text}&quot;</p>
              <p className="text-sm text-gray-500">— {quote.author}</p>
            </div>
          </Card>
        </div>

        <div className="mt-12">
          <Card title="Features">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h5 className="font-semibold text-gray-900">⚡ Next.js 16</h5>
                <p className="mt-1 text-sm text-gray-600">
                  App Router with server components
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">🎨 Tailwind CSS</h5>
                <p className="mt-1 text-sm text-gray-600">
                  Utility-first styling framework
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">📦 TypeScript</h5>
                <p className="mt-1 text-sm text-gray-600">
                  Type-safe development
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">🧩 Components</h5>
                <p className="mt-1 text-sm text-gray-600">
                  Reusable UI component library
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">🛠️ Utilities</h5>
                <p className="mt-1 text-sm text-gray-600">
                  Date, math, and storage helpers
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">📊 Seed Data</h5>
                <p className="mt-1 text-sm text-gray-600">
                  Health facts and motivational content
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Link href={getStartedHref}>
                <Button size="lg">Get Started</Button>
              </Link>
              <Button variant="outline">Learn More</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
