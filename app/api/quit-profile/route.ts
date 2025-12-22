import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCurrentUserId,
  calculateDaysSinceQuit,
  calculateCigarettesAvoided,
  calculateMoneySaved,
} from "@/lib/api-utils";

// GET /api/quit-profile
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const userId = await getCurrentUserId();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { quitProfile: true },
    });

    if (!user || !user.quitProfile) {
      return NextResponse.json(
        { success: false, data: null, message: "No quit profile found" },
        { status: 404 }
      );
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

    return NextResponse.json({
      success: true,
      data: {
        ...quitProfile,
        daysSinceQuit,
        cigarettesAvoided,
        moneySaved,
      },
    });
  } catch (error) {
    console.error("Error fetching quit profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/quit-profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = await getCurrentUserId();
    const body = await request.json();

    const {
      quitDate,
      cigarettesPerDay,
      costPerPack,
      cigarettesPerPack = 20,
      personalGoal,
    } = body;

    if (!quitDate || cigarettesPerDay == null || costPerPack == null) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: quitDate, cigarettesPerDay, costPerPack",
        },
        { status: 400 }
      );
    }

    const parsedQuitDate = new Date(quitDate);
    if (Number.isNaN(parsedQuitDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid quitDate" },
        { status: 400 }
      );
    }

    if (parsedQuitDate > new Date()) {
      return NextResponse.json(
        { success: false, message: "Quit date cannot be in the future" },
        { status: 400 }
      );
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    const quitProfile = await prisma.quitProfile.upsert({
      where: { userId },
      update: {
        quitDate: parsedQuitDate,
        cigarettesPerDay: Number(cigarettesPerDay),
        costPerPack: Number(costPerPack),
        cigarettesPerPack: Number(cigarettesPerPack),
        personalGoal: personalGoal || null,
      },
      create: {
        userId,
        quitDate: parsedQuitDate,
        cigarettesPerDay: Number(cigarettesPerDay),
        costPerPack: Number(costPerPack),
        cigarettesPerPack: Number(cigarettesPerPack),
        personalGoal: personalGoal || null,
      },
    });

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

    return NextResponse.json({
      success: true,
      data: {
        ...quitProfile,
        daysSinceQuit,
        cigarettesAvoided,
        moneySaved,
      },
      message: "Quit profile saved successfully",
    });
  } catch (error) {
    console.error("Error saving quit profile:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}