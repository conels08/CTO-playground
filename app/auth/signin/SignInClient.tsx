"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type ProviderMap = Awaited<ReturnType<typeof getProviders>>;

export default function SignInClient() {
  const searchParams = useSearchParams();

  // If NextAuth sends a callbackUrl, respect it. Otherwise, go to onboarding (best UX for your app).
  const callbackUrl = searchParams.get("callbackUrl") ?? "/onboarding";

  // NextAuth puts errors on the URL sometimes (e.g., ?error=CredentialsSignin)
  const urlError = searchParams.get("error");

  const [providers, setProviders] = React.useState<ProviderMap>(null);
  const [isLoadingProviders, setIsLoadingProviders] = React.useState(true);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Friendly coach-style error message
  const [error, setError] = React.useState<string>("");

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const p = await getProviders();
        if (isMounted) setProviders(p);
      } catch {
        if (isMounted) setProviders(null);
      } finally {
        if (isMounted) setIsLoadingProviders(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!urlError) return;

    // Map NextAuth error codes to friendly text
    if (urlError === "CredentialsSignin") {
      setError("That email/password combo didn’t work. Try again — you’ve got this.");
    } else {
      setError("Something went wrong. Please try again.");
    }
  }, [urlError]);

  const credentialsProvider = providers?.credentials;
  const oauthProviders = providers
    ? Object.values(providers).filter((p) => p.id !== "credentials")
    : [];

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // IMPORTANT:
    // Use redirect: true so NextAuth handles navigation.
    // If credentials are wrong, NextAuth redirects back here with ?error=CredentialsSignin,
    // which we convert into a friendly message via the effect above.
    await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: true,
    });

    // No need to setIsSubmitting(false) here because a successful sign-in redirects away.
    // On failure, user lands back here and the component re-renders.
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <Card title="Welcome back">
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Sign in to save your progress across devices. One day at a time.
            </p>

            {error && (
              <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground">
                {error}
              </div>
            )}

            {isLoadingProviders ? (
              <p className="text-sm text-muted">Loading sign-in options...</p>
            ) : (
              <div className="space-y-3">
                {/* OAuth providers (Google, etc) */}
                {oauthProviders.length > 0 && (
                  <div className="space-y-2">
                    {oauthProviders.map((p) => (
                      <Button
                        key={p.id}
                        variant="outline"
                        className="w-full"
                        onClick={() => signIn(p.id, { callbackUrl })}
                      >
                        Continue with {p.name}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Credentials provider */}
                {credentialsProvider && (
                  <form onSubmit={handleCredentialsSubmit} className="space-y-3">
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                      >
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
                      <label
                        htmlFor="password"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={[
                          "w-full rounded-md border px-3 py-2 text-sm shadow-sm",
                          "border-border bg-surface text-foreground",
                          "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
                        ].join(" ")}
                        placeholder="Your password"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Continue"}
                    </Button>

                    <p className="text-xs text-muted text-center">
                      New here? For now, you’ll need the demo credentials until we enable self-signup.
                    </p>
                  </form>
                )}

                {!credentialsProvider && oauthProviders.length === 0 && (
                  <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground">
                    No sign-in providers are configured yet.
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 text-center">
              <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
                Back Home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
