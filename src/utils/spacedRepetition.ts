import { Flashcard } from '../types';

export type RepetitionRating = 'again' | 'hard' | 'good' | 'easy';

export interface SpacedRepetitionResult {
  nextReviewDate: string;
  intervalDays: number;
  easeFactor: number;
  status: 'new' | 'learning' | 'mastered';
  timesReviewed: number;
  lastReviewed: string;
}

/**
 * SM-2 Spaced Repetition Scheduling Algorithm
 */
export function calculateSpacedRepetition(
  card: Flashcard,
  rating: RepetitionRating
): SpacedRepetitionResult {
  let easeFactor = card.easeFactor || 2.5;
  let intervalDays = card.intervalDays || 0;
  let timesReviewed = (card.timesReviewed || 0) + 1;
  let status: 'new' | 'learning' | 'mastered' = card.status;

  const now = new Date();
  const lastReviewed = now.toISOString();

  if (rating === 'again') {
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    status = 'learning';
  } else if (rating === 'hard') {
    intervalDays = intervalDays <= 1 ? 2 : Math.round(intervalDays * 1.2);
    easeFactor = Math.max(1.3, easeFactor - 0.15);
    status = 'learning';
  } else if (rating === 'good') {
    if (intervalDays === 0) {
      intervalDays = 1;
    } else if (intervalDays === 1) {
      intervalDays = 3;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    status = timesReviewed >= 3 ? 'mastered' : 'learning';
  } else if (rating === 'easy') {
    if (intervalDays === 0) {
      intervalDays = 4;
    } else if (intervalDays === 1) {
      intervalDays = 7;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor * 1.3);
    }
    easeFactor = Math.min(3.0, easeFactor + 0.15);
    status = 'mastered';
  }

  const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  const nextReviewDate = nextReview.toISOString();

  return {
    nextReviewDate,
    intervalDays,
    easeFactor,
    status,
    timesReviewed,
    lastReviewed,
  };
}

/**
 * Checks if a card is due for review today or overdue
 */
export function isCardDueForReview(card: Flashcard): boolean {
  if (card.status === 'new') return true;
  if (!card.nextReviewDate) return true;

  const nextDate = new Date(card.nextReviewDate);
  const now = new Date();
  return nextDate <= now;
}

/**
 * Returns human-readable due status text e.g. "Due Today", "Overdue (2d)", "Due in 3d"
 */
export function getDueStatusLabel(card: Flashcard): { label: string; isDue: boolean; colorClass: string } {
  if (card.status === 'new') {
    return { 
      label: 'New Card (Due Now)', 
      isDue: true, 
      colorClass: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200' 
    };
  }
  if (!card.nextReviewDate) {
    return { 
      label: 'Due for Review', 
      isDue: true, 
      colorClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200' 
    };
  }

  const now = new Date();
  const nextDate = new Date(card.nextReviewDate);
  const diffTime = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: overdueDays > 0 ? `Overdue (${overdueDays}d)` : 'Due Today',
      isDue: true,
      colorClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200',
    };
  }

  return {
    label: `Due in ${diffDays}d`,
    isDue: false,
    colorClass: 'bg-[#F2EFE9] text-[#7A746B] border-[#D9D1C7] dark:bg-[#1A231C] dark:text-[#A6C4A7] dark:border-[#2F3E31]',
  };
}
