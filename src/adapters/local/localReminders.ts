import type { ReminderScheduler } from '../../application/ports';

let timer: number | undefined;

/**
 * In-page reminder using the Notification API. It only fires while the app is open;
 * true background push needs a Supabase/Web Push adapter plus the service worker.
 */
export const localReminders: ReminderScheduler = {
  isSupported: () => typeof Notification !== 'undefined',
  async requestPermission() {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    return (await Notification.requestPermission()) === 'granted';
  },
  async scheduleDaily(hour, minute) {
    await this.cancelAll();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    timer = window.setTimeout(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('StreakByte', { body: 'Keep your streak alive. One short lesson is enough.' });
      }
      void localReminders.scheduleDaily(hour, minute);
    }, next.getTime() - Date.now());
  },
  async cancelAll() {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
  },
};
