"use client";

import * as React from "react";
import Button from "@/components/ui/Button";

type StatusResponse = {
  success: boolean;
  signedIn: boolean;
  subscribed: boolean;
  email?: string;
};

export default function EmailSignup() {
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const [signedInEmail, setSignedInEmail] = React.useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/subscribe/status", { cache: "no-store" });
        const data = (await res.json()) as StatusResponse;

        if (!mounted) return;

        if (data?.signedIn && data?.email) {
          setSignedInEmail(data.email);
          setEmail(data.email); // prefill
        }

        setIsSubscribed(Boolean(data?.subscribed));
      } catch {
        // If status fails, we just show the form anyway.
      } finally {
        if (mounted) setLoadingStatus(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!consent) {
      setStatus("error");
      setMessage("Please check the consent box to subscribe.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, source: "home_hero" }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Could not subscribe.");
      }

      setStatus("success");
      setMessage(data.message || "You're subscribed! 🎉");

      // Delay hiding the form so the user sees confirmation
      setTimeout(() => {
        setIsSubscribed(true);
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not subscribe.");
    }
  }

  // If we know they’re subscribed, we can hide the entire box (or show a small badge instead)
  if (!loadingStatus && isSubscribed) return null;

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-xl">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-muted-foreground">
          Want new features, motivational tools, and progress upgrades as they ship?
        </p>

        {signedInEmail && (
          <p className="mt-2 text-xs text-muted-foreground">
            You’re signed in as <span className="font-medium text-foreground">{signedInEmail}</span>
          </p>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            // If they’re signed in, you can lock it to their account email for clarity
            readOnly={Boolean(signedInEmail)}
          />
          <Button type="submit" className="sm:w-40" disabled={status === "loading"}>
            {status === "loading" ? "Joining..." : "Join updates"}
          </Button>
        </div>

        <label className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>Yes—email me occasional product updates and tips. No spam. Unsubscribe anytime.</span>
        </label>

        {message && (
          <div
            className={[
              "mt-3 rounded-md border px-3 py-2 text-xs",
              status === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                : "border-red-500/30 bg-red-500/10 text-foreground",
            ].join(" ")}
          >
            {message}
          </div>
        )}
      </div>
    </form>
  );
}
