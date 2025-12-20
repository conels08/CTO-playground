"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { milestones } from "@/lib/data";
import { useRouter } from "next/navigation";

interface ProgressData {
  daysQuit: number;
  cigarettesAvoided: number;
  moneySaved: number;
  milestoneStatuses: Array<{
    days: number;
    achieved: boolean;
  }>;
  healthSnapshot: {
    averageCravingIntensity: number;
    recentCheckIns: number;
    mostCommonMood: string;
  };
  motivationalMessage: string;
}

interface QuitProfile {
  quitDate: string;
  cigarettesPerDay: number;
  costPerPack: number;
  cigarettesPerPack: number;
  personalGoal: string | null;
  daysSinceQuit: number;
  cigarettesAvoided: number;
  moneySaved: number;
}

interface CheckIn {
  id: string;
  date: string;
  cravingIntensity: number;
  mood: string;
  notes: string | null;
}

interface NewCheckInFormState {
  date: string;
  cravingIntensity: string;
  mood: string;
  notes: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [quitProfile, setQuitProfile] = useState<QuitProfile | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkInForm, setCheckInForm] = useState<NewCheckInFormState>(() => ({
    date: new Date().toISOString().split("T")[0],
    cravingIntensity: "5",
    mood: "",
    notes: "",
  }));
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [checkInError, setCheckInError] = useState("");

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const progressResponse = await fetch("/api/progress", { cache: "no-cache" });
      const progressResult = await progressResponse.json();

      if (progressResult.success) {
        setProgressData(progressResult.data);
      }

      const profileResponse = await fetch("/api/quit-profile", { cache: "no-cache" });
      const profileResult = await profileResponse.json();

      if (profileResult.success && profileResult.data) {
        setQuitProfile(profileResult.data);
      }

      const checkInsResponse = await fetch("/api/checkins", { cache: "no-cache" });
      const checkInsResult = await checkInsResponse.json();

      if (checkInsResult.success) {
        setRecentCheckIns(checkInsResult.data.slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00.000Z").toLocaleDateString();
  };

  const handleCheckInChange = (field: keyof NewCheckInFormState, value: string) => {
    setCheckInForm((prev) => ({ ...prev, [field]: value }));
    if (checkInError) setCheckInError("");
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCheckIn(true);
    setCheckInError("");

    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: checkInForm.date,
          cravingIntensity: Number(checkInForm.cravingIntensity),
          mood: checkInForm.mood || "neutral",
          notes: checkInForm.notes || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setCheckInError(result.message || "Failed to save check-in");
        return;
      }

      setCheckInForm({
        date: new Date().toISOString().split("T")[0],
        cravingIntensity: "5",
        mood: "",
        notes: "",
      });

      await fetchDashboardData();
    } catch (err) {
      console.error("Error creating check-in:", err);
      setCheckInError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-12 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400" />
              <p className="mt-4 text-gray-600 dark:text-slate-300">
                Loading your progress...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !progressData) {
    return (
      <div className="bg-gray-50 py-12 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600 dark:text-red-300">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quitProfile) {
    return (
      <div className="bg-gray-50 py-12 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
              Welcome to Your Dashboard
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">
              Let&apos;s set up your quit profile to start tracking your progress.
            </p>
            <div className="mt-8">
              <Button onClick={() => (window.location.href = "/onboarding")}>
                Set Up Quit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">
            {progressData?.motivationalMessage || "Track your smoke-free journey"}
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card title="Days Smoke-Free">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-emerald-400">
                {progressData?.daysQuit || quitProfile.daysSinceQuit || 0}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">days</p>
            </div>
          </Card>

          <Card title="Cigarettes Avoided">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-sky-400">
                {progressData?.cigarettesAvoided || quitProfile.cigarettesAvoided || 0}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">cigarettes</p>
            </div>
          </Card>

          <Card title="Money Saved">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-emerald-400">
                {formatCurrency(progressData?.moneySaved || quitProfile.moneySaved || 0)}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                total savings
              </p>
            </div>
          </Card>

          <Card title="Health Snapshot">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-300">Avg. craving:</span>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {progressData?.healthSnapshot.averageCravingIntensity || 0}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-300">Check-ins:</span>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {progressData?.healthSnapshot.recentCheckIns || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-300">Mood:</span>
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {progressData?.healthSnapshot.mostCommonMood || "N/A"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Milestones">
            <div className="space-y-3">
              {progressData?.milestoneStatuses.map((milestone) => {
                const milestoneData = milestones.find((m) => m.days === milestone.days);

                const achieved = milestone.achieved;

                return (
                  <div
                    key={milestone.days}
                    className={[
                      "flex items-start gap-3 rounded border p-3",
                      achieved
                        ? "border-green-200 bg-green-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                        : "border-gray-200 bg-white dark:border-white/10 dark:bg-slate-900/40",
                    ].join(" ")}
                  >
                    <span className="text-2xl">{milestoneData?.icon || "🎯"}</span>

                    <div className="flex-1">
                      <h4
                        className={[
                          "font-semibold",
                          achieved
                            ? "text-green-900 dark:text-emerald-200"
                            : "text-gray-900 dark:text-slate-100",
                        ].join(" ")}
                      >
                        {milestoneData?.title || `${milestone.days} Days`}
                      </h4>

                      <p
                        className={[
                          "text-sm",
                          achieved
                            ? "text-green-700 dark:text-emerald-200/80"
                            : "text-gray-600 dark:text-slate-300",
                        ].join(" ")}
                      >
                        {milestoneData?.description || `Smoke-free for ${milestone.days} days`}
                      </p>

                      {achieved && (
                        <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                          Achieved!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Recent Check-ins">
            <div className="space-y-4">
              {recentCheckIns.length > 0 ? (
                <div className="space-y-3">
                  {recentCheckIns.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="rounded border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900/40"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {formatDate(checkIn.date)}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-gray-600 dark:text-slate-300">
                            Craving: {checkIn.cravingIntensity}/10
                          </div>
                          <div className="text-sm text-gray-600 dark:text-slate-300">
                            Mood: {checkIn.mood}
                          </div>
                        </div>
                      </div>
                      {checkIn.notes && (
                        <p className="mt-2 text-sm text-gray-700 dark:text-slate-200">
                          {checkIn.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <Button size="sm" variant="outline" onClick={() => router.push("/check-ins")}>
                      View All Check-ins
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500 dark:text-slate-300">
                  <p>No check-ins yet.</p>
                  <p className="mt-1 text-sm">Start tracking your daily progress!</p>
                </div>
              )}

              <div className="mt-2 border-t border-gray-200 pt-4 dark:border-white/10">
                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
                  Add Today&apos;s Check-in
                </h3>

                {checkInError && (
                  <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                    {checkInError}
                  </div>
                )}

                <form onSubmit={handleCheckInSubmit} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Date
                    </label>
                    <input
                      type="date"
                      value={checkInForm.date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleCheckInChange("date", e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Craving Intensity (1–10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={checkInForm.cravingIntensity}
                      onChange={(e) => handleCheckInChange("cravingIntensity", e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Mood
                    </label>
                    <select
                      value={checkInForm.mood}
                      onChange={(e) => handleCheckInChange("mood", e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100"
                      required
                    >
                      <option value="">Select mood</option>
                      <option value="motivated">Motivated</option>
                      <option value="confident">Confident</option>
                      <option value="stressed">Stressed</option>
                      <option value="challenged">Challenged</option>
                      <option value="proud">Proud</option>
                      <option value="tired">Tired</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={checkInForm.notes}
                      onChange={(e) => handleCheckInChange("notes", e.target.value)}
                      className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400"
                      placeholder="How did today feel?"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={isSubmittingCheckIn}>
                      {isSubmittingCheckIn ? "Saving..." : "Save Check-in"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </div>

        {quitProfile.personalGoal && (
          <div className="mt-6">
            <Card title="Your Goal">
              <p className="text-gray-700 dark:text-slate-200">{quitProfile.personalGoal}</p>
            </Card>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={fetchDashboardData} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={() => (window.location.href = "/onboarding")}>
            Update Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
