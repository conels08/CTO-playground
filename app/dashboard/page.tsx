"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { dateUtils, mathUtils, storageUtils } from "@/lib/utils";
import { milestones } from "@/lib/data";

export default function DashboardPage() {
  // counter state
  const [count, setCount] = useState(() => storageUtils.getItem("counter", 0));

  // NEW: client-only date handling
  const [today, setToday] = useState<Date | null>(null);

  // On mount, set today's date (so server + client match)
  useEffect(() => {
    setToday(new Date());
  }, []);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    storageUtils.setItem("counter", newCount);
  };

  const handleReset = () => {
    setCount(0);
    storageUtils.setItem("counter", 0);
  };

  // If today isn't set yet, return nothing so the HTML matches server output
  if (!today) return null;


  return (
    <div className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-4 text-lg text-gray-600">
          Explore utilities and view milestones.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card title="Date Utilities Demo">
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Today:</strong> {dateUtils.formatDate(today)}
              </p>
              <p>
                <strong>Short format:</strong>{" "}
                {dateUtils.formatDateShort(today)}
              </p>
              <p>
                <strong>Week number:</strong> {dateUtils.getWeekNumber(today)}
              </p>
              <p>
                <strong>Is today:</strong>{" "}
                {dateUtils.isToday(today) ? "Yes" : "No"}
              </p>
              <p>
                <strong>7 days from now:</strong>{" "}
                {dateUtils.formatDate(dateUtils.addDays(today, 7))}
              </p>
            </div>
          </Card>

          <Card title="Math Utilities Demo">
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Clamp(15, 0, 10):</strong> {mathUtils.clamp(15, 0, 10)}
              </p>
              <p>
                <strong>Round 3.14159 (2 decimals):</strong>{" "}
                {mathUtils.roundToDecimal(3.14159, 2)}
              </p>
              <p>
                <strong>Percentage (75/200):</strong>{" "}
                {mathUtils.roundToDecimal(
                  mathUtils.calculatePercentage(75, 200),
                  1
                )}
                %
              </p>
              <p>
                <strong>Average [1,2,3,4,5]:</strong>{" "}
                {mathUtils.getAverage([1, 2, 3, 4, 5])}
              </p>
              <p>
                <strong>Median [1,2,3,4,5]:</strong>{" "}
                {mathUtils.getMedian([1, 2, 3, 4, 5])}
              </p>
            </div>
          </Card>

          <Card title="LocalStorage Demo">
            <div className="space-y-4">
              <p className="text-gray-600">
                This counter persists across page reloads using localStorage.
              </p>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">
                  {count}
                </span>
                <div className="flex gap-2">
                  <Button onClick={handleIncrement} size="sm">
                    Increment
                  </Button>
                  <Button onClick={handleReset} variant="secondary" size="sm">
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Milestones">
            <div className="space-y-3">
              {milestones.slice(0, 5).map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-3 rounded border p-3"
                >
                  <span className="text-2xl">{milestone.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {milestone.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
