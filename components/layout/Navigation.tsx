"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Dashboard", path: "/dashboard" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  // Close the menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-xl font-bold text-foreground">
            Quit Smoking Tracker
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center space-x-2 sm:flex sm:space-x-4">
            <div className="flex space-x-1 sm:space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-primary-foreground"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {session ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => signIn()}>
                Sign in
              </Button>
            )}

            <ThemeToggle />
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-2"
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        {open && (
          <div className="sm:hidden pb-4">
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-border bg-surface p-2">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={[
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-foreground text-primary-foreground"
                        : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                    ].join(" ")}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="mt-2 flex items-center gap-2">
                {session ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => signIn()}
                  >
                    Sign in
                  </Button>
                )}

                {/* Keep ThemeToggle accessible on mobile too */}
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
