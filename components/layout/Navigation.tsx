"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { signIn, signOut, useSession } from "next-auth/react";
import Button from "@/components/ui/Button";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Dashboard", path: "/dashboard" },
];

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

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

            {/* Auth button */}
            {session ? (
              <Button size="sm" variant="outline" onClick={() => signOut()}>
                Sign out
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => signIn()}>
                Sign in
              </Button>
            )}

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
