"use client";

import * as React from "react";
import Button from "@/components/ui/Button";

type SubscribePayload = {
  email: string;
  consent: boolean;
  source: string;

  // attribution
  landingUrl?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
};

function getAttributionFromLocation(): Omit<
  SubscribePayload,
  "email" | "consent" | "source"
> {
  // Only runs on client
  const landingUrl = typeof window !== "undefined" ? window.location.href : null;
  const referrer =
    typeof document !== "undefined" && document.referrer
      ? document.referrer
      : null;

  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();

  const pick = (key: string) => {
    const v = params.get(key);
    return v && v.trim().length > 0 ? v.trim() : null;
  };

  return {
    landingUrl,
    referrer,
    utmSource: pick("utm_source"),
    utmMedium: pick("utm_medium"),
    utmCampaign: pick("utm_campaign"),
    utmTerm: pick("utm_term"),
    utmContent: pick("utm_content"),
  };
}

export default function EmailSignup() {
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState("");

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
      const attribution = getAttributionFromLocation();

      const payload: SubscribePayload = {
        email,
        consent,
        source: "home_hero",
        ...attribution,
      };

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Could not subscribe.");
      }

      setStatus("success");
      setMessage(data.message || "Subscribed!");
      setEmail("");
      setConsent(false);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not subscribe.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-6 max-w-xl">
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-sm text-muted-foreground">
          Want new features, motivational tools, and progress upgrades as they ship?
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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
          <span>
            Yes—email me occasional product updates and tips. No spam. Unsubscribe anytime.
          </span>
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
