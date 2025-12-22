"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { milestones } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

function buildDemoData(): {
  progress: ProgressData;
  profile: QuitProfile;
  checkIns: CheckIn[];
} {
  const demoProfile: QuitProfile = {
    quitDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    cigarettesPerDay: 10,
    costPerPack: 10,
    cigarettesPerPack: 20,
    personalGoal: "I want my energy back and my mornings to feel clean.",
    daysSinceQuit: 14,
    cigarettesAvoided: 140,
    moneySaved: 70,
  };

  const demoProgress: ProgressData = {
    daysQuit: 14,
    cigarettesAvoided: 140,
    moneySaved: 70,
    milestoneStatuses: milestones.map((m) => ({
      days: m.days,
      achieved: 14 >= m.days,
    })),
    healthSnapshot: {
      averageCravingIntensity: 4.2,
      recentCheckIns: 5,
      mostCommonMood: "Proud",
    },
    motivationalMessage: "Demo Mode: You’re 14 days in — momentum is real.",
  };

  const today = new Date();
  const mk = (d: number) => new Date(today.getTime() - d * 86400000).toISOString().slice(0, 10);

  const demoCheckIns: CheckIn[] = [
    { id: "demo-1", date: mk(0), cravingIntensity: 4, mood: "proud", notes: "Craving hit after lunch, breathed through it." },
    { id: "demo-2", date: mk(1), cravingIntensity: 5, mood: "challenged", notes: "Stress spike, still didn’t cave." },
    { id: "demo-3", date: mk(2), cravingIntensity: 3, mood: "confident", notes: null },
    { id: "demo-4", date: mk(3), cravingIntensity: 6, mood: "stressed", notes: "Had a tough moment — walked it off." },
    { id: "demo-5", date: mk(4), cravingIntensity: 3, mood: "motivated", notes: null },
  ];

  return { progress: demoProgress, profile: demoProfile, checkIns: demoCheckIns };
}


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
  const { status } = useSession();
  const isDemo = status !== "authenticated";
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
    if (status === "loading") return;

    if (status === "authenticated") {
      fetchDashboardData();
      return;
    }

    // Demo mode
    const demo = buildDemoData();
    setProgressData(demo.progress);
    setQuitProfile(demo.profile);
    setRecentCheckIns(demo.checkIns);
    setError("");
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);


  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const progressResponse = await fetch("/api/progress", { cache: "no-cache" });

      if (progressResponse.status === 401) {
        const demo = buildDemoData();
        setProgressData(demo.progress);
        setQuitProfile(demo.profile);
        setRecentCheckIns(demo.checkIns);
        setError("");
        return;
      }

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
    if (isDemo) {
      setCheckInError("Demo Mode: sign in to save check-ins.");
      return;
    }

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
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
              <p className="mt-4 text-muted">Loading your progress...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !progressData) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <p className="mb-4 text-sm text-muted">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quitProfile) {
    return (
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to Your Dashboard
            </h1>
            <p className="mt-4 text-lg text-muted">
              Let&apos;s set up your quit profile to start tracking your progress.
            </p>
            <div className="mt-8">
              <Button onClick={() => (window.location.href = "/onboarding")}>
                Set Up Quit Profile
              </Button>
            </div>
            {isDemo && (
              <div className="mb-6 rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Demo Mode</p>
                    <p className="text-sm text-muted-foreground">
                      You’re viewing sample data. Sign in to save your real progress.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => signIn()}>
                    Sign in to save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-4 text-lg text-muted">
            {progressData?.motivationalMessage || "Track your smoke-free journey"}
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card title="Days Smoke-Free">
            <div className="text-center">
              <div className="text-4xl font-bold text-success dark:text-foreground">
                {progressData?.daysQuit || quitProfile.daysSinceQuit || 0}
              </div>
              <p className="mt-2 text-sm text-muted">days</p>
            </div>
          </Card>

          <Card title="Cigarettes Avoided">
            <div className="text-center">
              <div className="text-4xl font-bold text-info dark:text-foreground">
                {progressData?.cigarettesAvoided || quitProfile.cigarettesAvoided || 0}
              </div>
              <p className="mt-2 text-sm text-muted">cigarettes</p>
            </div>
          </Card>

          <Card title="Money Saved">
            <div className="text-center">
              <div className="text-4xl font-bold text-success dark:text-foreground">
                {formatCurrency(progressData?.moneySaved || quitProfile.moneySaved || 0)}
              </div>
              <p className="mt-2 text-sm text-muted">total savings</p>
            </div>
          </Card>

          <Card title="Health Snapshot">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Avg. craving:</span>
                <span className="font-medium text-foreground">
                  {progressData?.healthSnapshot.averageCravingIntensity || 0}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Check-ins:</span>
                <span className="font-medium text-foreground">
                  {progressData?.healthSnapshot.recentCheckIns || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Mood:</span>
                <span className="font-medium text-foreground">
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
                      achieved ? "border-border bg-surface-2" : "border-border bg-surface",
                    ].join(" ")}
                  >
                    <span className="text-2xl">{milestoneData?.icon || "🎯"}</span>

                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {milestoneData?.title || `${milestone.days} Days`}
                      </h4>

                      <p className="text-sm text-muted-foreground">
                        {milestoneData?.description ||
                          `Smoke-free for ${milestone.days} days`}
                      </p>

                      {achieved && (
                        <span
                          className={[
                            "mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium",
                            "border border-success/25 bg-success/15 text-success",
                          ].join(" ")}
                        >
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
                      className="rounded border border-border bg-surface p-3"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(checkIn.date)}
                        </span>
                        <div className="text-right">
                          <div className="text-sm text-muted">
                            Craving: {checkIn.cravingIntensity}/10
                          </div>
                          <div className="text-sm text-muted">Mood: {checkIn.mood}</div>
                        </div>
                      </div>

                      {checkIn.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {checkIn.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push("/check-ins")}
                    >
                      View All Check-ins
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-muted">
                  <p>No check-ins yet.</p>
                  <p className="mt-1 text-sm">Start tracking your daily progress!</p>
                </div>
              )}

              <div className="mt-2 border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Add Today&apos;s Check-in
                </h3>

                {checkInError && (
                  <div className="mb-3 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs text-foreground">
                    {checkInError}
                  </div>
                )}

                <form onSubmit={handleCheckInSubmit} className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Date
                    </label>
                    <input
                      type="date"
                      value={checkInForm.date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => handleCheckInChange("date", e.target.value)}
                      className={[
                        "w-full rounded-md border px-2 py-1.5 text-sm shadow-sm",
                        "border-border bg-surface text-foreground",
                        "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
                      ].join(" ")}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Craving Intensity (1–10)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={checkInForm.cravingIntensity}
                      onChange={(e) =>
                        handleCheckInChange("cravingIntensity", e.target.value)
                      }
                      className={[
                        "w-full rounded-md border px-2 py-1.5 text-sm shadow-sm",
                        "border-border bg-surface text-foreground",
                        "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
                      ].join(" ")}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Mood
                    </label>
                    <select
                      value={checkInForm.mood}
                      onChange={(e) => handleCheckInChange("mood", e.target.value)}
                      className={[
                        "w-full rounded-md border px-2 py-1.5 text-sm shadow-sm",
                        "border-border bg-surface text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring",
                      ].join(" ")}
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
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={checkInForm.notes}
                      onChange={(e) => handleCheckInChange("notes", e.target.value)}
                      className={[
                        "w-full rounded-md border px-2 py-1.5 text-sm shadow-sm",
                        "border-border bg-surface text-foreground",
                        "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring",
                      ].join(" ")}
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
              <p className="text-muted-foreground">{quitProfile.personalGoal}</p>
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
