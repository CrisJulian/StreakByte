import type { CompletionSummary, NetworkLabState, PcBuildState } from '../../types/streakbyte';
import { scoreNetworkBuild } from './network';
import { scorePcBuild } from './pcBuild';

/** Builds the Lesson Complete payload for the PC lab. Copy is unchanged from the original store. */
export function summarizePcBuild(pc: PcBuildState, learnerName = 'Learner'): CompletionSummary {
  const { accuracyPct, missedDualChannel, usedRamSlots } = scorePcBuild(pc);
  return {
    title: `Nice build, ${learnerName}!`,
    subtitle: 'You installed 5 of 5 parts and kept your streak alive.',
    xp: '+120',
    accuracy: `${accuracyPct}%`,
    partsLabel: 'Parts',
    partsValue: '5 / 5',
    review: [
      [
        'Dual-channel RAM',
        missedDualChannel ? `You used slots ${usedRamSlots}` : 'Slots A2 and B2 matched',
      ],
      ['DDR4 vs DDR5', 'Not compatible'],
      ['RAM notch', 'Check the orientation'],
    ],
    next: ['Lesson 4: Storage', 'HDD, SSD and M.2', '6 min · +120 XP'],
  };
}

export function summarizeNetworkBuild(net: NetworkLabState, learnerName = 'Learner'): CompletionSummary {
  const { accuracyPct } = scoreNetworkBuild(net);
  return {
    title: `Nice build, ${learnerName}!`,
    subtitle: 'Your PC and laptop reached the router and passed the connection check.',
    xp: '+150',
    accuracy: `${accuracyPct}%`,
    partsLabel: 'Devices',
    partsValue: '2 / 2',
    review: [
      ['IP address basics', 'Each host needs a unique address on 192.168.1.0/24'],
      ['Subnet masks', '255.255.255.0 keeps both devices on the same LAN'],
    ],
    next: ['Subnet masks', 'Split one network into parts', '6 min · +120 XP'],
  };
}

export interface QuizSummaryInput {
  lessonTitle: string;
  lessonXp: number;
  score: { correct: number; total: number; accuracyPct: number; missed: { topic: string; choices: string[]; correctIndex: number }[] };
  next: [string, string, string];
  /** When given, the subtitle says whether the lesson is now complete. */
  passed?: boolean;
  passMark?: number;
}

function passNote(input: QuizSummaryInput): string {
  if (input.passed === undefined) return '';
  const mark = input.passMark ?? 3;
  return input.passed
    ? ' Lesson complete!'
    : ` You need ${mark} correct to complete this lesson. Review the topics below and try again.`;
}

/** Lesson Complete payload for a finished quiz, built from the real answers. */
export function summarizeQuiz(input: QuizSummaryInput, learnerName = 'Learner'): CompletionSummary {
  const { score } = input;
  const xp = score.total === 0 ? 0 : Math.round((input.lessonXp * score.correct) / score.total);
  return {
    title: score.accuracyPct >= 80 ? `Nice work, ${learnerName}!` : `Good effort, ${learnerName}!`,
    subtitle: `You answered ${score.correct} of ${score.total} correctly in ${input.lessonTitle}.${passNote(input)}`,
    xp: `+${xp}`,
    accuracy: `${score.accuracyPct}%`,
    partsLabel: 'Questions',
    partsValue: `${score.correct} / ${score.total}`,
    review:
      score.missed.length === 0
        ? [['All answers correct', 'Nothing to review']]
        : score.missed.map((q) => [q.topic, `Answer: ${q.choices[q.correctIndex]}`] as [string, string]),
    next: input.next,
  };
}
