import type {
  AuthService,
  ProgressRepository,
  ReminderScheduler,
  StudyBuddyService,
  SyncQueue,
} from './application/ports';
import { supabaseAuth } from './adapters/supabase/supabaseAuth';
import { localProgress } from './adapters/local/localProgress';
import { localReminders } from './adapters/local/localReminders';
import { geminiStudyBuddy } from './adapters/gemini/geminiStudyBuddy';
import { localSyncQueue } from './adapters/local/localSyncQueue';

export interface Services {
  auth: AuthService;
  progress: ProgressRepository;
  studyBuddy: StudyBuddyService;
  reminders: ReminderScheduler;
  syncQueue: SyncQueue;
}

/**
 * The only file that knows which adapter is used. To go live, import the Supabase
 * adapters here and swap them in; nothing else in the app changes.
 */
export const services: Services = {
  auth: supabaseAuth,
  progress: localProgress,
  studyBuddy: geminiStudyBuddy,
  reminders: localReminders,
  syncQueue: localSyncQueue,
};
