// Utility functions for the quit smoking tracker

// Utility functions for the quit smoking tracker

import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// Generate a simple random string for anonymous device IDs.
function generateDeviceId() {
  return `device_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

// Get or create a per-device user id stored in a cookie
export async function getCurrentUserId(): Promise<string> {
  // In Next 16, cookies() is async
  const cookieStore = await cookies();

  let deviceId = cookieStore.get("qs_device_id")?.value;

  // If no cookie yet, create one and set it
  if (!deviceId) {
    deviceId = randomUUID();

    cookieStore.set("qs_device_id", deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return deviceId;
}

// Calculate days since quit date
export function calculateDaysSinceQuit(quitDate: Date): number {
  const now = new Date();
  const timeDiff = now.getTime() - quitDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return Math.max(0, daysDiff);
}

// Calculate cigarettes avoided based on quit profile
export function calculateCigarettesAvoided(
  cigarettesPerDay: number,
  quitDate: Date
): number {
  const daysSinceQuit = calculateDaysSinceQuit(quitDate);
  return daysSinceQuit * cigarettesPerDay;
}

// Calculate money saved
export function calculateMoneySaved(
  cigarettesPerDay: number,
  quitDate: Date,
  costPerPack: number,
  cigarettesPerPack: number = 20
): number {
  const daysSinceQuit = calculateDaysSinceQuit(quitDate);
  const packsPerDay = cigarettesPerDay / cigarettesPerPack;
  const moneyPerDay = packsPerDay * costPerPack;
  return Math.round(daysSinceQuit * moneyPerDay * 100) / 100; // Round to 2 decimals
}

// Calculate milestone achievements
export function calculateMilestoneStatus(daysSinceQuit: number) {
  const milestones = [
    { days: 1, achieved: daysSinceQuit >= 1 },
    { days: 3, achieved: daysSinceQuit >= 3 },
    { days: 7, achieved: daysSinceQuit >= 7 },
    { days: 14, achieved: daysSinceQuit >= 14 },
    { days: 30, achieved: daysSinceQuit >= 30 },
    { days: 90, achieved: daysSinceQuit >= 90 },
    { days: 365, achieved: daysSinceQuit >= 365 }
  ];
  
  return milestones;
}

// Format date for API responses
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Parse date from API requests
export function parseDateFromAPI(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}