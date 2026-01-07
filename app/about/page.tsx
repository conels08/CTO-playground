import Card from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-foreground">About</h1>
        <p className="mt-4 text-lg text-muted">
          Learn more about this project and its features.
        </p>

        <div className="mt-8 space-y-6">
          <Card title="Project Overview">
            <p className="text-muted-foreground">
              This quit smoking tracker was built to be simple, honest, and actually useful. After quitting smoking myself and staying smoke-free for over a year, I realized how powerful it is to see real progress — days added up, cravings reduced, and milestones reached. I wanted others to have an easy, free way to track that journey without ads, pressure, or gimmicks. This app is built using modern web technology (Next.js, Supabase, and secure cloud hosting) to make sure your data is safe, fast, and accessible anywhere. My goal is — and always will be — to create low-to-no-cost web tools that solve real problems for real people. If you choose to subscribe, you’ll automatically get free access to my next online tool when it launches, along with occasional updates about other useful projects I’m working on. No spam — just value, transparency, and tools designed to help.
            </p>
          </Card>

          <Card title="Technology Stack">
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Next.js 16:</strong>{" "}
                React framework with App Router for server-side rendering
              </li>
              <li>
                <strong className="text-foreground">TypeScript:</strong>{" "}
                Type-safe JavaScript for better development experience
              </li>
              <li>
                <strong className="text-foreground">Tailwind CSS:</strong>{" "}
                Utility-first CSS framework for rapid UI development
              </li>
              <li>
                <strong className="text-foreground">ESLint:</strong> Code linting
                for consistent code quality
              </li>
              <li>
                <strong className="text-foreground">Prettier:</strong> Code
                formatting for consistent code style
              </li>
            </ul>
          </Card>

          <Card title="Project Structure">
            <div className="space-y-2 text-muted-foreground">
              <p>
                <code className="rounded bg-surface-2 px-2 py-1 text-sm text-foreground">
                  /app
                </code>{" "}
                - Next.js app router pages and layouts
              </p>
              <p>
                <code className="rounded bg-surface-2 px-2 py-1 text-sm text-foreground">
                  /components
                </code>{" "}
                - Reusable React components
              </p>
              <p>
                <code className="rounded bg-surface-2 px-2 py-1 text-sm text-foreground">
                  /lib/utils
                </code>{" "}
                - Utility functions for date, math, and storage
              </p>
              <p>
                <code className="rounded bg-surface-2 px-2 py-1 text-sm text-foreground">
                  /lib/data
                </code>{" "}
                - Seed data for health facts, milestones, and quotes
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
