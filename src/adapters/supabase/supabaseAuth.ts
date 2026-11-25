import type { AuthService, AuthUser } from '../../application/ports';
import { supabase } from './supabaseClient';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
  }
  return supabase;
}

function toAuthUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AuthUser {
  const email = user.email ?? '';
  const displayName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    email.split('@')[0] ||
    'Learner';
  const rawAvatar = user.user_metadata?.avatar_url ?? user.user_metadata?.picture;
  const avatarUrl =
    typeof rawAvatar === 'string' && rawAvatar.startsWith('https://') ? rawAvatar : undefined;
  return {
    id: user.id,
    email,
    displayName,
    ...(avatarUrl ? { avatarUrl } : {}),
  };
}

export const supabaseAuth: AuthService = {
  async currentUser() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (data.user) return toAuthUser(data.user);
    // Fall back to cached session when offline / network fails so PWA users stay signed in.
    if (error && (error.status === undefined || error.status === 0)) {
      const { data: sessionData } = await supabase.auth.getSession();
      return sessionData.session?.user ? toAuthUser(sessionData.session.user) : null;
    }
    return null;
  },

  async signIn(email, password, keepLoggedIn) {
    if (!email.trim() || !password) throw new Error('Enter your email and password.');
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign-in failed. Try again.');
    if (!keepLoggedIn) {
      // Supabase persists sessions by default; sign out locally on tab close
      window.addEventListener('beforeunload', () => void client.auth.signOut(), { once: true });
    }
    return toAuthUser(data.user);
  },

  async signUp(email, password) {
    if (!email.includes('@')) throw new Error('Use a valid email address.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({ email: email.trim(), password });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Sign-up failed. Try again.');
    return toAuthUser(data.user);
  },

  async signInWithGoogle() {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) throw new Error(error.message);
  },

  onAuthStateChange(callback) {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' && !session) return;
      callback(session?.user ? toAuthUser(session.user) : null);
    });
    return () => data.subscription.unsubscribe();
  },

  async sendPasswordReset(email) {
    if (!email.trim()) throw new Error('Enter your email first.');
    const client = requireSupabase();
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${window.location.pathname}`,
    });
    if (error) throw new Error(error.message);
  },

  async signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },
};
