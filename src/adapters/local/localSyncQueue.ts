import type { SyncOperation, SyncQueue } from '../../application/ports';
import { safeLocalStorage } from './storage';

const KEY = 'streakbyte-sync-queue';
const read = (): SyncOperation[] => {
  const raw = safeLocalStorage.get(KEY);
  return raw ? (JSON.parse(raw) as SyncOperation[]) : [];
};

export const localSyncQueue: SyncQueue = {
  async enqueue(op) {
    const all = read();
    all.push({ ...op, id: `${Date.now()}-${all.length}`, createdAt: Date.now() });
    safeLocalStorage.set(KEY, JSON.stringify(all));
  },
  async pending() {
    return read();
  },
  async flush(send) {
    const remaining: SyncOperation[] = [];
    for (const op of read()) {
      try {
        await send(op);
      } catch {
        remaining.push(op); // keep order, retry next time
      }
    }
    safeLocalStorage.set(KEY, JSON.stringify(remaining));
  },
};
