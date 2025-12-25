import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { DailyCheckIn } from "@prisma/client";

import {
  getCurrentUserId,
  calculateDaysSinceQuit,
  calculateCigarettesAvoided,
  calculateMoneySaved,
  calculateMilestoneStatus,
} from "@/lib/api-utils";

// GET /api/progress
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = await getCurrentUserId(session);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        quitProfile: true,
        checkIns: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { date: "desc" },
        },
      },
    });

    // If no quit profile exists, return safe defaults
    if (!user || !user.quitProfile) {
      const ms = calculateMilestoneStatus(0);
      const milestoneStatuses = Array.isArray(ms) ? ms : [];

      return NextResponse.json({
        success: true,
        data: {
          // ✅ keep old key + new key so UI won’t break
          daysQuit: 0,
          daysSinceQuit: 0,

          cigarettesAvoided: 0,
          moneySaved: 0,

          milestoneStatuses,

          healthSnapshot: {
            averageCravingIntensity: 0,
            recentCheckIns: 0,
            mostCommonMood: "N/A",
          },

          motivationalMessage: "Start your smoke-free journey today!",
        },
      });
    }

    const quitProfile = user.quitProfile;

    const daysSinceQuit = calculateDaysSinceQuit(quitProfile.quitDate);

    const cigarettesAvoided = calculateCigarettesAvoided(
      quitProfile.cigarettesPerDay,
      daysSinceQuit
    );

    const moneySaved = calculateMoneySaved(
      quitProfile.cigarettesPerDay,
      daysSinceQuit,
      quitProfile.costPerPack,
      quitProfile.cigarettesPerPack
    );

    // ✅ Make sure this is ALWAYS an array for the dashboard .map()
    const ms = calculateMilestoneStatus(daysSinceQuit);
    const milestoneStatuses = Array.isArray(ms) ? ms : [];

    const motivationalMessage = generateMotivationalMessage(
      daysSinceQuit,
      cigarettesAvoided,
      moneySaved
    );

    const healthSnapshot = calculateHealthSnapshot(user.checkIns);

    return NextResponse.json({
      success: true,
      data: {
        // ✅ keep both keys for compatibility
        daysQuit: daysSinceQuit,
        daysSinceQuit,

        cigarettesAvoided,
        moneySaved,

        milestoneStatuses,
        healthSnapshot,
        motivationalMessage,
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateMotivationalMessage(
  daysSinceQuit: number,
  cigarettesAvoided: number,
  moneySaved: number
): string {
  if (daysSinceQuit === 0) return "Start your smoke-free journey today!";
  if (daysSinceQuit === 1) return "Congratulations on your first smoke-free day!";
  if (daysSinceQuit < 7)
    return `Great job! You've been smoke-free for ${daysSinceQuit} day${
      daysSinceQuit > 1 ? "s" : ""
    }.`;
  if (daysSinceQuit < 30)
    return `Amazing progress! ${daysSinceQuit} days smoke-free and you've avoided ${cigarettesAvoided} cigarettes.`;
  if (daysSinceQuit < 90)
    return `Outstanding! You've saved $${moneySaved.toFixed(
      2
    )} and avoided ${cigarettesAvoided} cigarettes.`;
  if (daysSinceQuit < 365)
    return `Incredible! You're ${Math.floor(daysSinceQuit / 30)} months smoke-free. Keep it up!`;
  return `Fantastic! You've been smoke-free for over a year! You've avoided ${cigarettesAvoided} cigarettes and saved $${moneySaved.toFixed(
    2
  )}.`;
}

function calculateHealthSnapshot(
  checkIns: Array<Pick<DailyCheckIn, "cravingIntensity" | "mood">>
) {
  if (!checkIns || checkIns.length === 0) {
    return {
      averageCravingIntensity: 0,
      recentCheckIns: 0,
      mostCommonMood: "N/A",
    };
  }

  const totalCraving = checkIns.reduce(
    (sum, checkIn) => sum + checkIn.cravingIntensity,
    0
  );
  const averageCravingIntensity = Math.round((totalCraving / checkIns.length) * 10) / 10;

  const moodCount: Record<string, number> = {};
  for (const c of checkIns) moodCount[c.mood] = (moodCount[c.mood] || 0) + 1;

  const mostCommonMood = Object.keys(moodCount).reduce((a, b) =>
    moodCount[a] > moodCount[b] ? a : b
  );

  return {
    averageCravingIntensity,
    recentCheckIns: checkIns.length,
    mostCommonMood: mostCommonMood.charAt(0).toUpperCase() + mostCommonMood.slice(1),
  };
}
