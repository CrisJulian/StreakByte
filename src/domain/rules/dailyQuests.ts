export interface DailyActivityState {
  day: string;
  quizzesPassed: number;
  perfectQuizzes: number;
  labsCompleted: number;
  studyBuddyMessages: number;
  claimedIds: string[];
}

export type DailyQuestId = 'daily-quiz' | 'daily-lab' | 'daily-buddy';

export interface DailyQuest {
  id: DailyQuestId;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  icon: 'book' | 'wrench' | 'term';
}

export function createDailyActivity(day: string): DailyActivityState {
  return {
    day,
    quizzesPassed: 0,
    perfectQuizzes: 0,
    labsCompleted: 0,
    studyBuddyMessages: 0,
    claimedIds: [],
  };
}

/** Resets counters cleanly when the calendar day rolls over or state is missing. */
export function ensureDailyActivity(
  state: DailyActivityState | null | undefined,
  today: string,
): DailyActivityState {
  if (!state || state.day !== today) {
    return createDailyActivity(today);
  }
  return {
    day: state.day,
    quizzesPassed: Math.max(0, Number(state.quizzesPassed) || 0),
    perfectQuizzes: Math.max(0, Number(state.perfectQuizzes) || 0),
    labsCompleted: Math.max(0, Number(state.labsCompleted) || 0),
    studyBuddyMessages: Math.max(0, Number(state.studyBuddyMessages) || 0),
    claimedIds: Array.isArray(state.claimedIds) ? state.claimedIds : [],
  };
}

export function deriveDailyQuests(activity: DailyActivityState): DailyQuest[] {
  const claimed = new Set(activity.claimedIds);
  const quizProgress = Math.min(activity.quizzesPassed, 1);
  const labProgress = Math.min(activity.labsCompleted, 1);
  const buddyProgress = Math.min(activity.studyBuddyMessages, 1);

  return [
    {
      id: 'daily-quiz',
      title: 'Pass 1 lesson quiz',
      description: 'Score at least 3/4 on any lesson quiz today.',
      xpReward: 40,
      progress: quizProgress,
      target: 1,
      completed: quizProgress >= 1,
      claimed: claimed.has('daily-quiz'),
      icon: 'book',
    },
    {
      id: 'daily-lab',
      title: 'Finish 1 hands-on lab',
      description: 'Complete the PC Build or Network Build lab.',
      xpReward: 60,
      progress: labProgress,
      target: 1,
      completed: labProgress >= 1,
      claimed: claimed.has('daily-lab'),
      icon: 'wrench',
    },
    {
      id: 'daily-buddy',
      title: 'Ask BYTE 1 question',
      description: 'Chat with Study Buddy about any hardware or network topic.',
      xpReward: 25,
      progress: buddyProgress,
      target: 1,
      completed: buddyProgress >= 1,
      claimed: claimed.has('daily-buddy'),
      icon: 'term',
    },
  ];
}

export function claimDailyQuest(
  activity: DailyActivityState,
  questId: DailyQuestId,
): { next: DailyActivityState; rewardXp: number } {
  const quest = deriveDailyQuests(activity).find((q) => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) {
    return { next: activity, rewardXp: 0 };
  }
  return {
    next: {
      ...activity,
      claimedIds: [...activity.claimedIds, questId],
    },
    rewardXp: quest.xpReward,
  };
}
