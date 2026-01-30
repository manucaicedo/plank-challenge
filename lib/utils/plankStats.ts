interface Plank {
  date: string;
  duration: number;
}

export interface PlankStats {
  daysCompleted: number;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  totalTime: number;
  averageTime: number;
  longestPlank: number;
  completionRate: number;
}

export function calculatePlankStats(planks: Plank[], startDate: string, endDate: string): PlankStats {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate total days (from start to today or end, whichever is earlier)
  const effectiveEnd = today < end ? today : end;
  const totalDays = Math.ceil((effectiveEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Sort planks by date
  const sortedPlanks = [...planks].sort((a, b) => a.date.localeCompare(b.date));

  // Calculate basic stats
  const daysCompleted = planks.length;
  const totalTime = planks.reduce((sum, p) => sum + p.duration, 0);
  const averageTime = daysCompleted > 0 ? Math.floor(totalTime / daysCompleted) : 0;
  const longestPlank = daysCompleted > 0 ? Math.max(...planks.map((p) => p.duration)) : 0;
  const completionRate = totalDays > 0 ? Math.floor((daysCompleted / totalDays) * 100) : 0;

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Create a set of completed dates for quick lookup
  const completedDates = new Set(planks.map((p) => p.date));

  // Check streak from start date to today
  const current = new Date(start);
  let streakBroken = false;

  while (current <= effectiveEnd) {
    const dateStr = current.toISOString().split('T')[0];

    if (completedDates.has(dateStr)) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      streakBroken = false;
    } else {
      // Only break streak if this day has passed
      if (current < today) {
        tempStreak = 0;
        streakBroken = true;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  // Current streak is the temp streak if not broken
  currentStreak = streakBroken ? 0 : tempStreak;

  // Check if today's plank exists for current streak
  const todayStr = today.toISOString().split('T')[0];
  if (today >= start && today <= end && !completedDates.has(todayStr)) {
    // Check if yesterday has a plank to continue streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (completedDates.has(yesterdayStr)) {
      // Streak continues from yesterday
    } else {
      currentStreak = 0;
    }
  }

  return {
    daysCompleted,
    totalDays,
    currentStreak,
    longestStreak,
    totalTime,
    averageTime,
    longestPlank,
    completionRate,
  };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateImprovement(planks: Plank[]): number {
  if (planks.length < 2) {
    return 0; // Need at least 2 planks to calculate improvement
  }

  // Sort planks by date
  const sortedPlanks = [...planks].sort((a, b) => a.date.localeCompare(b.date));

  // Calculate how many planks to compare (up to 5 from start and end)
  const sampleSize = Math.min(5, Math.floor(sortedPlanks.length / 2));

  if (sampleSize === 0) {
    return 0;
  }

  // Get first N planks
  const firstPlanks = sortedPlanks.slice(0, sampleSize);
  const firstAverage = firstPlanks.reduce((sum, p) => sum + p.duration, 0) / firstPlanks.length;

  // Get last N planks
  const lastPlanks = sortedPlanks.slice(-sampleSize);
  const lastAverage = lastPlanks.reduce((sum, p) => sum + p.duration, 0) / lastPlanks.length;

  // Calculate percentage improvement
  if (firstAverage === 0) {
    return 0;
  }

  const improvement = ((lastAverage - firstAverage) / firstAverage) * 100;
  return Math.round(improvement);
}
