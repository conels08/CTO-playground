import Card from "@/components/ui/Card";

export default function AboutPage() {
  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">About</h1>
        <p className="mt-4 text-lg text-gray-600">
          Learn more about this project and its features.
        </p>

        <div className="mt-8 space-y-6">
          <Card title="Project Overview">
            <p className="text-gray-600">
              This is a modern web application built with Next.js 16,
              TypeScript, and Tailwind CSS. It demonstrates best practices for
              structuring a scalable web application with reusable components
              and utility functions.
            </p>
          </Card>

          <Card title="Technology Stack">
            <ul className="list-disc space-y-2 pl-5 text-gray-600">
              <li>
                <strong>Next.js 16:</strong> React framework with App Router for
                server-side rendering
              </li>
              <li>
                <strong>TypeScript:</strong> Type-safe JavaScript for better
                development experience
              </li>
              <li>
                <strong>Tailwind CSS:</strong> Utility-first CSS framework for
                rapid UI development
              </li>
              <li>
                <strong>ESLint:</strong> Code linting for consistent code
                quality
              </li>
              <li>
                <strong>Prettier:</strong> Code formatting for consistent code
                style
              </li>
            </ul>
          </Card>

          <Card title="Project Structure">
            <div className="space-y-2 text-gray-600">
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                  /app
                </code>{" "}
                - Next.js app router pages and layouts
              </p>
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                  /components
                </code>{" "}
                - Reusable React components
              </p>
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm">
                  /lib/utils
                </code>{" "}
                - Utility functions for date, math, and storage
              </p>
              <p>
                <code className="rounded bg-gray-100 px-2 py-1 text-sm">
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
