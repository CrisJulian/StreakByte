/** Storage that never throws (private mode, quota, SSR). */
export const safeLocalStorage = {
  get(key: string): string | null {
    try {
      return typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, value);
    } catch {
      /* ignore quota / private-mode errors */
    }
  },
  remove(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
