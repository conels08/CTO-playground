"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type ProviderMap = Awaited<ReturnType<typeof getProviders>>;

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [providers, setProviders] = React.useState<ProviderMap>(null);
  const [isLoadingProviders, setIsLoadingProviders] = React.useState(true);

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
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

  const credentialsProvider = providers?.credentials;
  const oauthProviders = providers
    ? Object.values(providers).filter((p) => p.id !== "credentials")
    : [];

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // NOTE: Many demo Credentials setups use "username" only (matches the default NextAuth UI you saw).
      // If your authorize() expects something else later (email/password), we’ll adjust then.
      await signIn("credentials", {
        username,
        password,
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <Card title="Sign In">
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Sign in to sync your progress across devices.
            </p>

            {/* Providers */}
            {isLoadingProviders ? (
              <p className="text-sm text-muted">Loading sign-in options...</p>
            ) : (
              <div className="space-y-3">
                {/* OAuth providers (Google, GitHub, etc) */}
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

                {/* Credentials provider (username/password/etc) */}
                {credentialsProvider && (
                  <form onSubmit={handleCredentialsSubmit} className="space-y-3">
                    <div>
                      <label
                        htmlFor="username"
                        className="mb-1 block text-xs font-medium text-muted-foreground"
                      >
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={[
                          "w-full rounded-md border px-3 py-2 text-sm shadow-sm",
                          "border-border bg-surface text-foreground",
                          "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
                        ].join(" ")}
                        placeholder="Enter a username"
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
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    {error && (
                      <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                )}

                {/* If no providers at all */}
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
