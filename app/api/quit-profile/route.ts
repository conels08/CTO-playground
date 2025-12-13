import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId, calculateDaysSinceQuit, calculateCigarettesAvoided, calculateMoneySaved } from '@/lib/api-utils';

// GET /api/quit-profile
// Fetch the current user's quit profile
export async function GET(request: NextRequest) {
  try {
    const userId = getCurrentUserId();
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { quitProfile: true }
    });
    
    // If user doesn't exist, return empty profile
    if (!user || !user.quitProfile) {
      return NextResponse.json({
        success: false,
        data: null,
        message: 'No quit profile found'
      }, { status: 404 });
    }
    
    // Calculate computed fields
    const quitProfile = user.quitProfile;
    const daysSinceQuit = calculateDaysSinceQuit(new Date(quitProfile.quitDate));
    const cigarettesAvoided = calculateCigarettesAvoided(
      quitProfile.cigarettesPerDay, 
      new Date(quitProfile.quitDate)
    );
    const moneySaved = calculateMoneySaved(
      quitProfile.cigarettesPerDay,
      new Date(quitProfile.quitDate),
      quitProfile.costPerPack,
      quitProfile.cigarettesPerPack
    );
    
    return NextResponse.json({
      success: true,
      data: {
        ...quitProfile,
        daysSinceQuit,
        cigarettesAvoided,
        moneySaved
      }
    });
    
  } catch (error) {
    console.error('Error fetching quit profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// POST /api/quit-profile
// Create or update the user's quit profile
export async function POST(request: NextRequest) {
  try {
    const userId = getCurrentUserId();
    const body = await request.json();
    
    // Validate required fields
    const { quitDate, cigarettesPerDay, costPerPack, cigarettesPerPack = 20, personalGoal } = body;
    
    if (!quitDate || !cigarettesPerDay || !costPerPack) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: quitDate, cigarettesPerDay, costPerPack'
      }, { status: 400 });
    }
    
    // Validate quit date is not in the future
    const parsedQuitDate = new Date(quitDate);
    if (parsedQuitDate > new Date()) {
      return NextResponse.json({
        success: false,
        message: 'Quit date cannot be in the future'
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
    
    // Upsert (create or update) quit profile
    const quitProfile = await prisma.quitProfile.upsert({
      where: { userId },
      update: {
        quitDate: parsedQuitDate,
        cigarettesPerDay: parseInt(cigarettesPerDay),
        costPerPack: parseFloat(costPerPack),
        cigarettesPerPack: parseInt(cigarettesPerPack),
        personalGoal: personalGoal || null
      },
      create: {
        userId,
        quitDate: parsedQuitDate,
        cigarettesPerDay: parseInt(cigarettesPerDay),
        costPerPack: parseFloat(costPerPack),
        cigarettesPerPack: parseInt(cigarettesPerPack),
        personalGoal: personalGoal || null
      }
    });
    
    // Calculate computed fields
    const daysSinceQuit = calculateDaysSinceQuit(parsedQuitDate);
    const cigarettesAvoided = calculateCigarettesAvoided(
      quitProfile.cigarettesPerDay, 
      parsedQuitDate
    );
    const moneySaved = calculateMoneySaved(
      quitProfile.cigarettesPerDay,
      parsedQuitDate,
      quitProfile.costPerPack,
      quitProfile.cigarettesPerPack
    );
    
    return NextResponse.json({
      success: true,
      data: {
        ...quitProfile,
        daysSinceQuit,
        cigarettesAvoided,
        moneySaved
      },
      message: 'Quit profile saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving quit profile:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}