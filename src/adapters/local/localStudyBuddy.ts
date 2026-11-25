import type { StudyBuddyContext, StudyBuddyService } from '../../application/ports';
import { getStudyBuddyReply, STUDY_BUDDY_GREETING } from '../../data/studyBuddy';

/** Offline keyword responder. Only answers from the lessons it knows; anything else gets the scope message. */
export const localStudyBuddy: StudyBuddyService = {
  greeting: STUDY_BUDDY_GREETING,
  reply: (question: string, context?: StudyBuddyContext) => getStudyBuddyReply(question, context),
};
