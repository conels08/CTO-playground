import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

import { getCurrentUserId, formatDateForAPI } from '@/lib/api-utils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/checkins
// Fetch daily check-ins for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = await getCurrentUserId(session);
    const { searchParams } = new URL(request.url);
    
    // Parse date range parameters
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    // Build where clause for date filtering
    const where: any = { userId };

    if (fromDate || toDate) {
      const dateFilter: any = {};

      if (fromDate) {
        dateFilter.gte = new Date(fromDate + "T00:00:00.000Z");
      }
      if (toDate) {
        dateFilter.lte = new Date(toDate + "T23:59:59.999Z");
      }

      where.date = dateFilter;
    }
    
    // Fetch check-ins
    const checkIns = await prisma.dailyCheckIn.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    
    // Format dates for response
    const formattedCheckIns = checkIns.map(checkIn => ({
      ...checkIn,
      date: formatDateForAPI(new Date(checkIn.date))
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedCheckIns
    });
    
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/checkins
// Create a new daily check-in for the current user
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
    
    const { date, cravingIntensity, mood, notes } = body as Record<string, unknown>;
    
    // Validate required fields
    if (!date || cravingIntensity === undefined || !mood) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: date, cravingIntensity, mood'
      }, { status: 400 });
    }

    if (typeof date !== "string") {
      return NextResponse.json({
        success: false,
        message: 'date must be a string'
      }, { status: 400 });
    }

    if (typeof mood !== "string") {
      return NextResponse.json({
        success: false,
        message: 'mood must be a string'
      }, { status: 400 });
    }

    const parsedCraving = Number(cravingIntensity);
    if (!Number.isFinite(parsedCraving)) {
      return NextResponse.json({
        success: false,
        message: 'cravingIntensity must be a number'
      }, { status: 400 });
    }
    
    // Validate craving intensity (1-10 scale)
    if (parsedCraving < 1 || parsedCraving > 10) {
      return NextResponse.json({
        success: false,
        message: 'Craving intensity must be between 1 and 10'
      }, { status: 400 });
    }
    
    // Validate date is not in the future
    const checkInDate = new Date(date + 'T00:00:00.000Z');
    if (Number.isNaN(checkInDate.getTime())) {
      return NextResponse.json({
        success: false,
        message: 'Invalid date'
      }, { status: 400 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate > today) {
      return NextResponse.json({
        success: false,
        message: 'Check-in date cannot be in the future'
      }, { status: 400 });
    }
    
    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId
        }
      });
    }
    
    // Try to create check-in (will fail if one already exists for this date)
    try {
      const checkIn = await prisma.dailyCheckIn.create({
        data: {
          userId,
          date: checkInDate,
          cravingIntensity: parsedCraving,
          mood: mood.trim(),
          notes: typeof notes === "string" && notes.trim() !== "" ? notes.trim() : null
        }
      });
      
      // Format date for response
      const formattedCheckIn = {
        ...checkIn,
        date: formatDateForAPI(checkInDate)
      };
      
      return NextResponse.json({
        success: true,
        data: formattedCheckIn,
        message: 'Check-in created successfully'
      }, { status: 201 });
      
    } catch (error: unknown) {
      // Handle unique constraint violation (duplicate check-in for same date)
      // Avoid importing Prisma runtime internals (Turbopack/Vercel can’t resolve them reliably)
      const code = (error as any)?.code;
      if (code === "P2002") {
        return NextResponse.json(
          { success: false, message: "A check-in already exists for this date" },
          { status: 409 }
        );
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
