import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getRandomHealthFact, getRandomQuote } from "@/lib/data";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// Check if user has a quit profile by attempting to fetch progress data


export default async function Home() {
  const healthFact = getRandomHealthFact();
  const quote = getRandomQuote();

  const session = await getServerSession(authOptions);

  let hasProfile = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { quitProfile: { select: { id: true } } },
    });

    hasProfile = Boolean(user?.quitProfile);
  }

  const getStartedHref = session
    ? hasProfile
      ? "/dashboard"
      : "/onboarding"
    : "/onboarding";

  const getStartedLabel = session
    ? hasProfile
      ? "Go to Dashboard"
      : "Finish Setup"
    : "Get Started";

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Welcome to Your Smoke-Free Journey
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-muted sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Track your days without cigarettes, unlock health milestones, and
            stay motivated with real health facts and inspirational quotes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card title="Health Fact of the Day">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">{healthFact.title}</h4>
              <p className="text-muted-foreground">{healthFact.fact}</p>

              <span className="inline-block rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-foreground">
                {healthFact.category}
              </span>
            </div>
          </Card>

          <Card title="Motivational Quote">
            <div className="space-y-2">
              <p className="italic text-foreground">
                &quot;{quote.text}&quot;
              </p>
              <p className="text-sm text-muted">— {quote.author}</p>
            </div>
          </Card>
        </div>

        <div className="mt-12">
          <Card title="Features">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h5 className="font-semibold text-foreground">⚡ Next.js 16</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  App Router with server components
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground">🎨 Tailwind CSS</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Utility-first styling framework
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground">📦 TypeScript</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Type-safe development
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground">🧩 Components</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reusable UI component library
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground">🛠️ Utilities</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Date, math, and storage helpers
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-foreground">📊 Seed Data</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Health facts and motivational content
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link href={getStartedHref}>
                <Button size="lg">{getStartedLabel}</Button>
              </Link>

              {/* Demo CTA (keeps nav clean, gives visitors an instant hook) */}
              {!session && (
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Take a Quick Tour
                  </Button>
                </Link>
              )}

              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
