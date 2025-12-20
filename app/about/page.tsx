import Card from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
          About
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">
          Learn more about this project and its features.
        </p>

        <div className="mt-8 space-y-6">
          <Card title="Project Overview">
            <p className="text-gray-600 dark:text-slate-300">
              This is a modern web application built with Next.js 16,
              TypeScript, and Tailwind CSS. It demonstrates best practices for
              structuring a scalable web application with reusable components
              and utility functions.
            </p>
          </Card>

          <Card title="Technology Stack">
            <ul className="list-disc space-y-2 pl-5 text-gray-600 dark:text-slate-300">
              <li>
                <strong className="text-gray-900 dark:text-slate-100">
                  Next.js 16:
                </strong>{" "}
                React framework with App Router for server-side rendering
              </li>
              <li>
                <strong className="text-gray-900 dark:text-slate-100">
                  TypeScript:
                </strong>{" "}
                Type-safe JavaScript for better development experience
              </li>
              <li>
                <strong className="text-gray-900 dark:text-slate-100">
                  Tailwind CSS:
                </strong>{" "}
                Utility-first CSS framework for rapid UI development
              </li>
              <li>
                <strong className="text-gray-900 dark:text-slate-100">
                  ESLint:
                </strong>{" "}
                Code linting for consistent code quality
              </li>
              <li>
                <strong className="text-gray-900 dark:text-slate-100">
                  Prettier:
                </strong>{" "}
                Code formatting for consistent code style
              </li>
            </ul>
          </Card>

          <Card title="Project Structure">
            <div className="space-y-2 text-gray-600 dark:text-slate-300">
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-900 dark:bg-white/10 dark:text-slate-100">
                  /app
                </code>{" "}
                - Next.js app router pages and layouts
              </p>
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-900 dark:bg-white/10 dark:text-slate-100">
                  /components
                </code>{" "}
                - Reusable React components
              </p>
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-900 dark:bg-white/10 dark:text-slate-100">
                  /lib/utils
                </code>{" "}
                - Utility functions for date, math, and storage
              </p>
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm text-gray-900 dark:bg-white/10 dark:text-slate-100">
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
