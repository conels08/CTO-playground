// Utility functions for the quit smoking tracker

// Get the current demo user ID (in production, this would be from authentication)
export function getCurrentUserId(): string {
  return "demo-user";
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