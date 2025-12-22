"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useSession, signIn } from "next-auth/react";

interface CheckIn {
  id: string;
  date: string; // ISO string like "2025-12-16"
  cravingIntensity: number;
  mood: string;
  notes: string | null;
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { status } = useSession();
  const isDemo = status !== "authenticated";


  useEffect(() => {
    // Demo mode: show sample data and skip API calls.
    if (isDemo) {
      setCheckIns(demoCheckIns);
      setIsLoading(false);
      setError("");
      return;
    }

    const fetchCheckIns = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/checkins", { cache: "no-cache" });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load check-ins");
        }

        setCheckIns(result.data);
      } catch (err) {
        console.error("Error fetching check-ins:", err);
        setError(err instanceof Error ? err.message : "Failed to load check-ins");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckIns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemo]);

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00.000Z").toLocaleDateString();
  };

  const demoCheckIns: CheckIn[] = [
    {
      id: "demo-1",
      date: "2025-12-20",
      cravingIntensity: 4,
      mood: "confident",
      notes: "Cravings popped up after dinner. Took a walk and it passed.",
    },
    {
      id: "demo-2",
      date: "2025-12-19",
      cravingIntensity: 6,
      mood: "challenged",
      notes: "Stress day. Kept it together. Big win.",
    },
    {
      id: "demo-3",
      date: "2025-12-18",
      cravingIntensity: 3,
      mood: "motivated",
      notes: null,
    },
  ];

  return (
    <div className="min-h-screen py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            All Check-ins
          </h1>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Back to Dashboard
          </Button>
        </div>

        {isDemo && (
          <div className="mb-6 rounded-2xl border border-orange-200/80 bg-orange-50/70 px-4 py-3 dark:border-orange-400/25 dark:bg-orange-400/10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 items-center rounded-full bg-orange-600 px-2 text-xs font-semibold text-white dark:bg-orange-300 dark:text-slate-950">
                  DEMO
                </span>

                <div>
                  <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                    You’re viewing sample check-ins
                  </p>
                  <p className="text-sm text-orange-900/80 dark:text-orange-100/80">
                    Sign in to save and view your real history.
                  </p>
                </div>
              </div>

              <div className="sm:pl-4">
                <Button size="sm" variant="outline" onClick={() => signIn()}>
                  Sign in to save
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-600 dark:text-slate-300">Loading check-ins...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && checkIns.length === 0 && (
          <Card>
            <p className="text-center text-gray-600 dark:text-slate-300">
              No check-ins yet. Start tracking from your dashboard!
            </p>
          </Card>
        )}

        {!isLoading && !error && checkIns.length > 0 && (
          <Card>
            <div className="divide-y divide-gray-200 dark:divide-white/10">
              {checkIns.map((checkIn) => (
                <div key={checkIn.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        {formatDate(checkIn.date)}
                      </p>
                      <p className="mt-1 text-sm text-gray-700 dark:text-slate-200">
                        Craving: {checkIn.cravingIntensity}/10 — Mood: {checkIn.mood}
                      </p>
                      {checkIn.notes && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                          {checkIn.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
