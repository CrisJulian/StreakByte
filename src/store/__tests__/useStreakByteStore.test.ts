import { beforeEach, describe, expect, it } from 'vitest';
import { parseHash, useStreakByteStore } from '../useStreakByteStore';
import { getStudyBuddyReply } from '../../data/studyBuddy';

describe('parseHash', () => {
  it('defaults empty or unknown hashes to dashboard', () => {
    expect(parseHash('')).toEqual({ view: 'dashboard' });
    expect(parseHash('#')).toEqual({ view: 'dashboard' });
    expect(parseHash('#not-a-real-route')).toEqual({ view: 'dashboard' });
  });

  it('maps legacy #sandboxes and #lesson/network correctly', () => {
    expect(parseHash('#sandboxes')).toEqual({ view: 'lesson', lab: 'pc' });
    expect(parseHash('#lesson/pc')).toEqual({ view: 'lesson', lab: 'pc' });
    expect(parseHash('#lesson/network')).toEqual({ view: 'lesson', lab: 'net' });
  });

  it('recognizes all standard views', () => {
    expect(parseHash('#curriculum')).toEqual({ view: 'curriculum' });
    expect(parseHash('#practice')).toEqual({ view: 'practice' });
    expect(parseHash('#achievements')).toEqual({ view: 'achievements' });
    expect(parseHash('#leaderboard')).toEqual({ view: 'leaderboard' });
    expect(parseHash('#profile')).toEqual({ view: 'profile' });
    expect(parseHash('#complete')).toEqual({ view: 'complete' });
  });
});

describe('useStreakByteStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useStreakByteStore.getState().resetAll();
  });

  it('rejects mismatched PC part placement and increments bad counter', () => {
    const store = useStreakByteStore.getState();
    store.selectPcPart('gpu');
    store.placePcPart('A1');

    const { pc } = useStreakByteStore.getState();
    expect(pc.bad).toBe(1);
    expect(pc.ok).toBe(0);
    expect(pc.ram).toEqual({});
    expect(pc.message).toContain('Not there.');
    expect(pc.message).toContain('PCIe x16');
  });

  it('tracks RAM slots, rejects duplicate filled slot, and calculates dual-channel accuracy on completion', () => {
    const store = useStreakByteStore.getState();

    // Install non-dual-channel RAM in A1 and B1
    store.placePcPart('A1', 'ram');
    // Try placing again into A1 (already filled)
    store.placePcPart('A1', 'ram');
    expect(useStreakByteStore.getState().pc.message).toBe('That slot already has a part installed.');
    expect(useStreakByteStore.getState().pc.ok).toBe(1);

    store.placePcPart('B1', 'ram');
    store.placePcPart('M2', 'm2');
    store.placePcPart('PCIE', 'gpu');
    store.placePcPart('PWR', 'psu');

    useStreakByteStore.getState().completePcBuild();

    const state = useStreakByteStore.getState();
    expect(state.view).toBe('complete');
    expect(state.completion?.title).toBe('Nice build, Mika!');
    expect(state.completion?.accuracy).toBe('83%'); // 5 / (5 + 0 + 1 dual penalty)
    expect(state.completion?.review[0]).toEqual(['Dual-channel RAM', 'You used slots A1 and B1']);
  });

  it('awards 100% accuracy when dual-channel A2 and B2 are used with zero errors', () => {
    const store = useStreakByteStore.getState();
    store.placePcPart('A2', 'ram');
    store.placePcPart('B2', 'ram');
    store.placePcPart('M2', 'm2');
    store.placePcPart('PCIE', 'gpu');
    store.placePcPart('PWR', 'psu');

    useStreakByteStore.getState().completePcBuild();

    const state = useStreakByteStore.getState();
    expect(state.completion?.accuracy).toBe('100%');
    expect(state.completion?.review[0]).toEqual(['Dual-channel RAM', 'Slots A2 and B2 matched']);
  });

  it('validates network device placement and IP/subnet/gateway configuration', () => {
    const store = useStreakByteStore.getState();

    // Wrong spot placement
    store.placeNetworkDevice('hub', 'pc');
    expect(useStreakByteStore.getState().net.bad).toBe(1);
    expect(useStreakByteStore.getState().net.message).toBe('PC belongs on the PC spot.');

    // Correct hub placement
    store.placeNetworkDevice('hub', 'hub');
    expect(useStreakByteStore.getState().net.placed.hub).toBe(true);

    // Invalid IP, mask, gateway
    useStreakByteStore.getState().openNetworkConfig('laptop');
    let ok = useStreakByteStore.getState().saveNetworkConfig({
      ip: '192.168.1.1',
      mask: '255.255.0.0',
      gw: '10.0.0.1',
      cab: 'eth',
    });
    expect(ok).toBe(false);
    expect(useStreakByteStore.getState().net.errors.ip).toContain('router');
    expect(useStreakByteStore.getState().net.errors.mask).toContain('255.255.255.0');
    expect(useStreakByteStore.getState().net.errors.gw).toContain('192.168.1.1');
    expect(useStreakByteStore.getState().net.openDevice).toBe('laptop');

    // Duplicate IP matching PC's 192.168.1.10
    ok = useStreakByteStore.getState().saveNetworkConfig({
      ip: '192.168.1.10',
      mask: '255.255.255.0',
      gw: '192.168.1.1',
      cab: 'eth',
    });
    expect(ok).toBe(false);
    expect(useStreakByteStore.getState().net.errors.ip).toContain('already uses');

    // Valid config
    ok = useStreakByteStore.getState().saveNetworkConfig({
      ip: '192.168.1.20',
      mask: '255.255.255.0',
      gw: '192.168.1.1',
      cab: 'fiber',
    });
    expect(ok).toBe(true);
    expect(useStreakByteStore.getState().net.openDevice).toBeNull();
    expect(useStreakByteStore.getState().net.cfg.laptop?.ip).toBe('192.168.1.20');
  });

  it('persists theme choice and ignores empty study buddy messages while replying offline', () => {
    useStreakByteStore.getState().setTheme('light');
    expect(useStreakByteStore.getState().theme).toBe('light');

    useStreakByteStore.getState().setChatOpen(true);
    const initialCount = useStreakByteStore.getState().chat.messages.length;
    expect(initialCount).toBe(1); // Welcome greeting

    useStreakByteStore.getState().sendChatMessage('   ');
    expect(useStreakByteStore.getState().chat.messages.length).toBe(initialCount);

    useStreakByteStore.getState().sendChatMessage('Explain the RAM key notch');
    const msgs = useStreakByteStore.getState().chat.messages;
    expect(msgs.length).toBe(initialCount + 2);
    expect(msgs[msgs.length - 2]).toMatchObject({ role: 'me', text: 'Explain the RAM key notch' });
    expect(msgs[msgs.length - 1].role).toBe('bot');
    expect(msgs[msgs.length - 1].text.toLowerCase()).toContain('notch');

    expect(getStudyBuddyReply('Quiz me on Lesson 3').length).toBeGreaterThan(20);
    expect(getStudyBuddyReply('A2 and B2')).toContain('Spot on!');
    expect(getStudyBuddyReply('a2 b2')).toContain('Spot on!');
  });

  it('supports guest login and logout flow', async () => {
    const store = useStreakByteStore.getState();
    expect(store.view).toBe('login');
    expect(store.authUser).toBeNull();
    expect(store.isGuest).toBe(false);

    store.loginAsGuest();
    const authedState = useStreakByteStore.getState();
    expect(authedState.isGuest).toBe(true);
    expect(authedState.authUser?.displayName).toBe('Guest Learner');
    expect(authedState.view).toBe('dashboard');

    await authedState.logout();
    const loggedOutState = useStreakByteStore.getState();
    expect(loggedOutState.isGuest).toBe(false);
    expect(loggedOutState.authUser).toBeNull();
    expect(loggedOutState.view).toBe('login');
  });
});

describe('quiz flow in the store', () => {
  beforeEach(() => {
    localStorage.clear();
    useStreakByteStore.getState().resetAll();
  });

  it('starts a quiz from the hash and does not restart it on a second sync', () => {
    useStreakByteStore.getState().syncFromHash('#quiz/hw-3');
    const first = useStreakByteStore.getState().quiz;
    expect(useStreakByteStore.getState().view).toBe('quiz');
    expect(first?.questions.length).toBe(4);
    expect(first?.questions.every((q) => q.choices.length === 4)).toBe(true);

    useStreakByteStore.getState().selectQuizChoice(1);
    useStreakByteStore.getState().syncFromHash('#quiz/hw-3');
    expect(useStreakByteStore.getState().quiz?.selected).toBe(1);
  });

  it('falls back to the curriculum for an unknown lesson key', () => {
    useStreakByteStore.getState().syncFromHash('#quiz/nope-9');
    expect(useStreakByteStore.getState().view).toBe('curriculum');
    expect(useStreakByteStore.getState().quiz).toBeNull();
  });

  it('finishes with a real score, saves missed topics, and goes to Lesson Complete', () => {
    useStreakByteStore.getState().syncFromHash('#quiz/hw-3');

    for (let i = 0; i < 4; i += 1) {
      const quiz = useStreakByteStore.getState().quiz!;
      const q = quiz.questions[quiz.index];
      // answer the first question correctly, the rest wrong
      const pick = i === 0 ? q.correctIndex : (q.correctIndex + 1) % 4;
      useStreakByteStore.getState().selectQuizChoice(pick);
      useStreakByteStore.getState().submitQuizAnswer();
      useStreakByteStore.getState().nextQuizQuestion();
    }

    const state = useStreakByteStore.getState();
    expect(state.view).toBe('complete');
    expect(state.quiz).toBeNull();
    expect(state.completion?.partsValue).toBe('1 / 4');
    expect(state.completion?.accuracy).toBe('25%');
    expect(state.completion?.xp).toBe('+30'); // 120 XP lesson * 1/4
    expect(state.completion?.review.length).toBe(3);
    expect(state.completion?.next[0]).toBe('Lesson 4: Storage');
  });
});
