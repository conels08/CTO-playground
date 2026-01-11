import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted">
          © {new Date().getFullYear()} Quit Smoking Tracker. Built with Next.js and
          Tailwind CSS by Colby Nelsen (Site Assistant PDX).
        </p>

        <Link
            href="/about#support"
            className="hover:text-foreground transition-colors"
          >
            Support this project
          </Link>
      </div>
    </footer>
  );
}
