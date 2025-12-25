"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useSession, signIn } from "next-auth/react";

interface QuitProfileFormData {
  quitDate: string;
  cigarettesPerDay: string;
  costPerPack: string;
  cigarettesPerPack: string;
  personalGoal: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const isDemo = status !== "authenticated";
  const [formData, setFormData] = useState<QuitProfileFormData>({
    quitDate: "",
    cigarettesPerDay: "",
    costPerPack: "",
    cigarettesPerPack: "20",
    personalGoal: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: keyof QuitProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        quitDate: formData.quitDate,
        cigarettesPerDay: parseInt(formData.cigarettesPerDay),
        costPerPack: parseFloat(formData.costPerPack),
        cigarettesPerPack: parseInt(formData.cigarettesPerPack),
        personalGoal: formData.personalGoal || null,
      };

      if (isDemo) {
        try {
          localStorage.setItem("demo-quit-profile", JSON.stringify(payload));
        } catch (storageError) {
          console.error("Unable to save demo profile locally:", storageError);
        }

        router.push("/dashboard");
        return;
      }

      const response = await fetch("/api/quit-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save profile");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.quitDate &&
      formData.cigarettesPerDay &&
      parseInt(formData.cigarettesPerDay) > 0 &&
      formData.costPerPack &&
      parseFloat(formData.costPerPack) > 0
    );
  };

  return (
    <div className="py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">
            Start Your Smoke-Free Journey
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">
            Let&apos;s set up your quit profile to start tracking your progress and celebrating your achievements.
          </p>
        </div>

        <Card title="Quit Profile Setup">
          {isDemo && (
            <div className="mb-6 rounded-md border border-orange-300/70 bg-orange-100/70 p-4 text-sm text-emerald-900 dark:border-orange-400/30 dark:bg-orange-500/10 dark:text-emerald-100">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Demo Mode: your data stays on this device unless you sign in.
                </span>
                <Button size="sm" variant="outline" onClick={() => signIn()}>
                  Sign in to save
                </Button>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="quitDate" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Quit Date *
              </label>
              <input
                type="date"
                id="quitDate"
                value={formData.quitDate}
                onChange={(e) => handleInputChange("quitDate", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                The date you quit or plan to quit smoking
              </p>
            </div>

            <div>
              <label htmlFor="cigarettesPerDay" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Cigarettes per day *
              </label>
              <input
                type="number"
                id="cigarettesPerDay"
                value={formData.cigarettesPerDay}
                onChange={(e) => handleInputChange("cigarettesPerDay", e.target.value)}
                min="1"
                max="100"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="e.g., 20"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                How many cigarettes did you typically smoke per day?
              </p>
            </div>

            <div>
              <label htmlFor="costPerPack" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Cost per pack *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 dark:text-slate-400">$</span>
                <input
                  type="number"
                  id="costPerPack"
                  value={formData.costPerPack}
                  onChange={(e) => handleInputChange("costPerPack", e.target.value)}
                  step="0.01"
                  min="0.01"
                  max="100"
                  className="w-full rounded-md border border-gray-300 bg-white py-2 pl-8 pr-3 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400"
                  placeholder="e.g., 12.50"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Average cost of a pack of cigarettes in your area
              </p>
            </div>

            <div>
              <label htmlFor="cigarettesPerPack" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Cigarettes per pack
              </label>
              <select
                id="cigarettesPerPack"
                value={formData.cigarettesPerPack}
                onChange={(e) => handleInputChange("cigarettesPerPack", e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100"
              >
                <option value="10">10 cigarettes</option>
                <option value="20">20 cigarettes (standard)</option>
                <option value="25">25 cigarettes</option>
                <option value="30">30 cigarettes</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Standard packs are usually 20 cigarettes
              </p>
            </div>

            <div>
              <label htmlFor="personalGoal" className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                Personal Goal (Optional)
              </label>
              <textarea
                id="personalGoal"
                value={formData.personalGoal}
                onChange={(e) => handleInputChange("personalGoal", e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder:text-slate-400"
                placeholder="e.g., I want to save money for a vacation, improve my health for my family..."
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                What&apos;s your motivation for quitting? This will help keep you motivated!
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={!isFormValid() || isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Start Tracking"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
          <p>Your data is stored locally and securely. You can update these settings anytime from your dashboard.</p>
        </div>
      </div>
    </div>
  );
}
