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
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: null },
        { status: 401 }
      );
    }

    const userId = await getCurrentUserId(session);

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

    const userId = await getCurrentUserId(session);
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const {
      quitDate,
      cigarettesPerDay,
      costPerPack,
      cigarettesPerPack = 20,
      personalGoal,
    } = body as Record<string, unknown>;

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

    if (typeof quitDate !== "string") {
      return NextResponse.json(
        { success: false, message: "quitDate must be a string" },
        { status: 400 }
      );
    }

    const parsedCigarettesPerDay = Number(cigarettesPerDay);
    const parsedCostPerPack = Number(costPerPack);
    const parsedCigarettesPerPack = Number(cigarettesPerPack);

    if (!Number.isFinite(parsedCigarettesPerDay) || parsedCigarettesPerDay <= 0) {
      return NextResponse.json(
        { success: false, message: "cigarettesPerDay must be a positive number" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedCostPerPack) || parsedCostPerPack <= 0) {
      return NextResponse.json(
        { success: false, message: "costPerPack must be a positive number" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(parsedCigarettesPerPack) || parsedCigarettesPerPack <= 0) {
      return NextResponse.json(
        { success: false, message: "cigarettesPerPack must be a positive number" },
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
        cigarettesPerDay: parsedCigarettesPerDay,
        costPerPack: parsedCostPerPack,
        cigarettesPerPack: parsedCigarettesPerPack,
        personalGoal:
          typeof personalGoal === "string" && personalGoal.trim() !== ""
            ? personalGoal.trim()
            : null,
      },
      create: {
        userId,
        quitDate: parsedQuitDate,
        cigarettesPerDay: parsedCigarettesPerDay,
        costPerPack: parsedCostPerPack,
        cigarettesPerPack: parsedCigarettesPerPack,
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
