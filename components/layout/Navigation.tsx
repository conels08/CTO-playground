"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Dashboard", path: "/dashboard" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Quit Smoking Tracker
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex space-x-1 sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? "bg-gray-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Easy to find on mobile */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
