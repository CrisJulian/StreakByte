import type {
  AuthService,
  ProgressRepository,
  ReminderScheduler,
  StudyBuddyService,
  SyncQueue,
} from './application/ports';
import { localAuth } from './adapters/local/localAuth';
import { localProgress } from './adapters/local/localProgress';
import { localReminders } from './adapters/local/localReminders';
import { localStudyBuddy } from './adapters/local/localStudyBuddy';
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
  auth: localAuth,
  progress: localProgress,
  studyBuddy: localStudyBuddy,
  reminders: localReminders,
  syncQueue: localSyncQueue,
};
