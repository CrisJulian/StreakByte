import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = vi.hoisted(() => ({
  getUser: vi.fn(),
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOAuth: vi.fn(),
  onAuthStateChange: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: { auth: mockAuth },
}));

import { supabaseAuth } from '../supabaseAuth';

describe('supabaseAuth adapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps user metadata and only accepts https avatar URLs', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'u-1',
          email: 'ada@example.com',
          user_metadata: {
            full_name: 'Ada Lovelace',
            avatar_url: 'https://lh3.googleusercontent.com/ada.jpg',
          },
        },
      },
      error: null,
    });

    await expect(supabaseAuth.currentUser()).resolves.toEqual({
      id: 'u-1',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      avatarUrl: 'https://lh3.googleusercontent.com/ada.jpg',
    });

    mockAuth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'u-2',
          email: 'grace@example.com',
          user_metadata: {
            name: 'Grace Hopper',
            picture: 'javascript:alert(1)',
          },
        },
      },
      error: null,
    });

    await expect(supabaseAuth.currentUser()).resolves.toEqual({
      id: 'u-2',
      email: 'grace@example.com',
      displayName: 'Grace Hopper',
    });
  });

  it('falls back to cached session when getUser fails offline', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Failed to fetch', status: undefined },
    });
    mockAuth.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'u-offline',
            email: 'offline@example.com',
            user_metadata: { full_name: 'Offline User' },
          },
        },
      },
    });

    await expect(supabaseAuth.currentUser()).resolves.toEqual({
      id: 'u-offline',
      email: 'offline@example.com',
      displayName: 'Offline User',
    });
    expect(mockAuth.getSession).toHaveBeenCalledTimes(1);
  });

  it('starts Google OAuth with select_account prompt and clean redirectTo', async () => {
    mockAuth.signInWithOAuth.mockResolvedValue({ data: {}, error: null });

    await supabaseAuth.signInWithGoogle();

    expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${window.location.pathname}`,
        queryParams: { prompt: 'select_account' },
      },
    });
  });

  it('forwards auth state changes and unsubscribes cleanly', () => {
    const unsubscribe = vi.fn();
    let listener: ((event: string, session: unknown) => void) | undefined;
    mockAuth.onAuthStateChange.mockImplementation((cb) => {
      listener = cb;
      return { data: { subscription: { unsubscribe } } };
    });

    const received: Array<unknown> = [];
    const stop = supabaseAuth.onAuthStateChange((u) => received.push(u));

    listener?.('INITIAL_SESSION', null);
    listener?.('SIGNED_IN', {
      user: {
        id: 'u-3',
        email: 'linus@example.com',
        user_metadata: { full_name: 'Linus Torvalds' },
      },
    });
    listener?.('SIGNED_OUT', null);

    expect(received).toEqual([
      { id: 'u-3', email: 'linus@example.com', displayName: 'Linus Torvalds' },
      null,
    ]);

    stop();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
