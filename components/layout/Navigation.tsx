"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/Button";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const baseNavItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  const authedNavItems = [
    ...baseNavItems,
    { name: "Dashboard", path: "/dashboard" },
  ];

  const navItems = session ? authedNavItems : baseNavItems;

  // Where we want users to land after auth
  const callbackUrl = "/dashboard";

  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-foreground">
              Quit Smoking Tracker
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
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

            {/* Auth actions */}
            {status === "loading" ? null : session ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => signIn(undefined, { callbackUrl })}
                >
                  Sign in
                </Button>

                <Link href={`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                  <Button size="sm">Create account</Button>
                </Link>
              </div>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
