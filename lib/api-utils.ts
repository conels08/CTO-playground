import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken")?.value;

  if (!sessionToken) {
    // Fallback demo user so the app still works without real auth UI
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        email: "demo@example.com",
      } as any,
    });
    return demoUser.id;
  }

  const user = await prisma.user.findFirst({
    where: {
      sessionToken,
    } as any,
  });

  if (!user) {
    const demoUser = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        email: "demo@example.com",
      } as any,
    });
    return demoUser.id;
  }

  return user.id;
}

export function calculateDaysSinceQuit(quitDate: Date): number {
  const start = new Date(quitDate);
  const today = new Date();

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function calculateCigarettesAvoided(
  cigarettesPerDay: number,
  daysSinceQuit: number
): number {
  return Math.max(0, cigarettesPerDay * daysSinceQuit);
}

export function calculateMoneySaved(
  cigarettesPerDay: number,
  daysSinceQuit: number,
  costPerPack: number,
  cigarettesPerPack: number
): number {
  const packsPerDay = cigarettesPerDay / cigarettesPerPack;
  return Number((packsPerDay * costPerPack * daysSinceQuit).toFixed(2));
}

export function formatDateForAPI(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Calculate milestone achievements (array used by /api/progress and dashboard)
export function calculateMilestoneStatus(daysSinceQuit: number) {
  const milestones = [1, 3, 7, 14, 30, 90, 365];

  return milestones.map((days) => ({
    days,
    achieved: daysSinceQuit >= days,
  }));
}

export function isMilestoneAchieved(daysSinceQuit: number, milestoneDays: number) {
  return daysSinceQuit >= milestoneDays;
}
