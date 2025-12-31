"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/onboarding";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not create account");
      }

      // Immediately sign in via NextAuth
      await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <Card title="Create your account">
          <div className="space-y-4">
            <p className="text-sm text-muted">
              You’re one step away. Create an account to save your progress and keep building momentum.
            </p>

            {error && (
              <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={[
                    "w-full rounded-md border px-3 py-2 text-sm shadow-sm",
                    "border-border bg-surface text-foreground",
                    "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
                  ].join(" ")}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={[
                    "w-full rounded-md border px-3 py-2 text-sm shadow-sm",
                    "border-border bg-surface text-foreground",
                    "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
                  ].join(" ")}
                  placeholder="Create a password"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create account"}
              </Button>
            </form>

            <div className="flex items-center justify-between pt-2 text-sm">
              <Link className="text-muted-foreground hover:text-foreground" href="/auth/signin">
                Already have an account? Sign in
              </Link>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => router.push("/")}
                type="button"
              >
                Back home
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
