"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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

  useEffect(() => {
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
        setError(
          err instanceof Error ? err.message : "Failed to load check-ins"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckIns();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00.000Z").toLocaleDateString();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">All Check-ins</h1>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Back to Dashboard
          </Button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <p className="text-gray-600">Loading check-ins...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {!isLoading && !error && checkIns.length === 0 && (
          <Card>
            <p className="text-center text-gray-600">
              No check-ins yet. Start tracking from your dashboard!
            </p>
          </Card>
        )}

        {!isLoading && !error && checkIns.length > 0 && (
          <Card>
            <div className="divide-y divide-gray-200">
              {checkIns.map((checkIn) => (
                <div key={checkIn.id} className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(checkIn.date)}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        Craving: {checkIn.cravingIntensity}/10 — Mood:{" "}
                        {checkIn.mood}
                      </p>
                      {checkIn.notes && (
                        <p className="mt-1 text-sm text-gray-600">
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
