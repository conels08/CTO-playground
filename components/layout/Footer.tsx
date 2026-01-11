import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted">
          © {new Date().getFullYear()} Quit Smoking Tracker. Built with Next.js and
          Tailwind CSS by Colby Nelsen (Site Assistant PDX).
        </p>

        <div className="mt-2 flex justify-center">
          <Link
            href="/about#support"
            className="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            Support this project
          </Link>
        </div>
      </div>
    </footer>
  );
}
