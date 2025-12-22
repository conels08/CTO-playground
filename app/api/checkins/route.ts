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

    const userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    
    // Parse date range parameters
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    
    // Build where clause for date filtering
    const where: any = { userId };
    
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) {
        where.date.gte = new Date(fromDate + 'T00:00:00.000Z');
      }
      if (toDate) {
        where.date.lte = new Date(toDate + 'T23:59:59.999Z');
      }
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

    const userId = await getCurrentUserId();
    const body = await request.json();
    
    const { date, cravingIntensity, mood, notes } = body;
    
    // Validate required fields
    if (!date || cravingIntensity === undefined || !mood) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: date, cravingIntensity, mood'
      }, { status: 400 });
    }
    
    // Validate craving intensity (1-10 scale)
    if (cravingIntensity < 1 || cravingIntensity > 10) {
      return NextResponse.json({
        success: false,
        message: 'Craving intensity must be between 1 and 10'
      }, { status: 400 });
    }
    
    // Validate date is not in the future
    const checkInDate = new Date(date + 'T00:00:00.000Z');
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
          cravingIntensity: parseInt(cravingIntensity),
          mood: mood.toString(),
          notes: notes || null
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
      
    } catch (error: any) {
      // Handle unique constraint violation (duplicate check-in for same date)
      if (error.code === 'P2002') {
        return NextResponse.json({
          success: false,
          message: 'A check-in already exists for this date'
        }, { status: 409 });
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