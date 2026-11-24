import type { AuthService, AuthUser } from '../../application/ports';
import { safeLocalStorage } from './storage';

const KEY = 'streakbyte-local-user';

/**
 * Offline/dev stand-in until the Supabase adapter exists. NOT secure: it accepts any
 * non-empty credentials so the UI flow can be built and tested.
 */
export const localAuth: AuthService = {
  async currentUser() {
    const raw = safeLocalStorage.get(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },
  async signIn(email, password, keepLoggedIn) {
    if (!email.trim() || !password) throw new Error('Enter your email or username and password.');
    const name = email.split('@')[0] || 'Learner';
    const user: AuthUser = { id: `local-${name}`, email: email.trim(), displayName: name };
    if (keepLoggedIn) safeLocalStorage.set(KEY, JSON.stringify(user));
    return user;
  },
  async signUp(email, password) {
    if (!email.includes('@')) throw new Error('Use your school email address.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    return this.signIn(email, password, true);
  },
  async sendPasswordReset(email) {
    if (!email.trim()) throw new Error('Enter your email first.');
  },
  async signOut() {
    safeLocalStorage.remove(KEY);
  },
};
