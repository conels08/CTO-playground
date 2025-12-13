import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { 
  getCurrentUserId, 
  calculateDaysSinceQuit, 
  calculateCigarettesAvoided, 
  calculateMoneySaved,
  calculateMilestoneStatus
} from '@/lib/api-utils';

// GET /api/progress
// Fetch computed progress statistics for the current user
export async function GET(request: NextRequest) {
  try {
    const userId = getCurrentUserId();
    
    // Find user with quit profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        quitProfile: true,
        checkIns: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });
    
    // If no quit profile exists, return default values
    if (!user || !user.quitProfile) {
      return NextResponse.json({
        success: true,
        data: {
          daysQuit: 0,
          cigarettesAvoided: 0,
          moneySaved: 0,
          milestoneStatuses: calculateMilestoneStatus(0),
          healthSnapshot: {
            averageCravingIntensity: 0,
            recentCheckIns: 0,
            mostCommonMood: 'N/A'
          },
          motivationalMessage: 'Start your smoke-free journey today!'
        }
      });
    }
    
    const quitProfile = user.quitProfile;
    
    // Calculate computed values
    const quitDate = new Date(quitProfile.quitDate);
    const daysQuit = calculateDaysSinceQuit(quitDate);
    const cigarettesAvoided = calculateCigarettesAvoided(
      quitProfile.cigarettesPerDay, 
      quitDate
    );
    const moneySaved = calculateMoneySaved(
      quitProfile.cigarettesPerDay,
      quitDate,
      quitProfile.costPerPack,
      quitProfile.cigarettesPerPack
    );
    
    // Calculate milestone achievements
    const milestoneStatuses = calculateMilestoneStatus(daysQuit);
    
    // Generate motivational message based on progress
    const motivationalMessage = generateMotivationalMessage(daysQuit, cigarettesAvoided, moneySaved);
    
    // Health snapshot from recent check-ins
    const healthSnapshot = calculateHealthSnapshot(user.checkIns);
    
    return NextResponse.json({
      success: true,
      data: {
        daysQuit,
        cigarettesAvoided,
        moneySaved,
        milestoneStatuses,
        healthSnapshot,
        motivationalMessage
      }
    });
    
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Helper function to generate motivational messages
function generateMotivationalMessage(daysQuit: number, cigarettesAvoided: number, moneySaved: number): string {
  if (daysQuit === 0) {
    return 'Start your smoke-free journey today!';
  }
  
  if (daysQuit === 1) {
    return 'Congratulations on your first smoke-free day!';
  }
  
  if (daysQuit < 7) {
    return `Great job! You've been smoke-free for ${daysQuit} day${daysQuit > 1 ? 's' : ''}.`;
  }
  
  if (daysQuit < 30) {
    return `Amazing progress! ${daysQuit} days smoke-free and you've avoided ${cigarettesAvoided} cigarettes.`;
  }
  
  if (daysQuit < 90) {
    return `Outstanding! You've saved $${moneySaved.toFixed(2)} and avoided ${cigarettesAvoided} cigarettes.`;
  }
  
  if (daysQuit < 365) {
    return `Incredible! You're ${Math.floor(daysQuit / 30)} months smoke-free. Keep it up!`;
  }
  
  return `Fantastic! You've been smoke-free for over a year! You've avoided ${cigarettesAvoided} cigarettes and saved $${moneySaved.toFixed(2)}.`;
}

// Helper function to calculate health snapshot from check-ins
function calculateHealthSnapshot(checkIns: any[]) {
  if (checkIns.length === 0) {
    return {
      averageCravingIntensity: 0,
      recentCheckIns: 0,
      mostCommonMood: 'N/A'
    };
  }
  
  // Calculate average craving intensity
  const totalCraving = checkIns.reduce((sum, checkIn) => sum + checkIn.cravingIntensity, 0);
  const averageCravingIntensity = Math.round((totalCraving / checkIns.length) * 10) / 10;
  
  // Count moods
  const moodCount: { [key: string]: number } = {};
  checkIns.forEach(checkIn => {
    moodCount[checkIn.mood] = (moodCount[checkIn.mood] || 0) + 1;
  });
  
  // Find most common mood
  const mostCommonMood = Object.keys(moodCount).reduce((a, b) => 
    moodCount[a] > moodCount[b] ? a : b, Object.keys(moodCount)[0]
  );
  
  return {
    averageCravingIntensity,
    recentCheckIns: checkIns.length,
    mostCommonMood: mostCommonMood.charAt(0).toUpperCase() + mostCommonMood.slice(1)
  };
}