import { beforeEach, describe, expect, it, vi } from 'vitest';
import { services } from '../../composition';
import { localDayString } from '../../domain/rules/xp';
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
    expect(parseHash('#arena')).toEqual({ view: 'arena' });
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

    store.placePcPart('CPU', 'cpu');
    store.placePcPart('COOLER', 'cooler');

    // Install non-dual-channel RAM in A1 and B1
    store.placePcPart('A1', 'ram');
    // Try placing again into A1 (already filled)
    store.placePcPart('A1', 'ram');
    expect(useStreakByteStore.getState().pc.message).toBe('That slot already has a part installed.');
    expect(useStreakByteStore.getState().pc.ok).toBe(3);

    store.placePcPart('B1', 'ram');
    store.placePcPart('M2', 'm2');
    store.placePcPart('PCIE', 'gpu');
    store.placePcPart('PWR', 'psu');

    useStreakByteStore.getState().completePcBuild();

    const state = useStreakByteStore.getState();
    expect(state.view).toBe('complete');
    expect(state.completion?.title).toBe('Nice build, Learner!');
    expect(state.completion?.accuracy).toBe('88%'); // 7 / (7 + 0 + 1 dual penalty)
    expect(state.completion?.review[0]).toEqual(['Dual-channel RAM', 'You used slots A1 and B1']);
  });

  it('awards 100% accuracy when dual-channel A2 and B2 are used with zero errors', () => {
    const store = useStreakByteStore.getState();
    store.placePcPart('CPU', 'cpu');
    store.placePcPart('COOLER', 'cooler');
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

  it('validates network device placement, cabling, IP/subnet/gateway configuration, and ping test', () => {
    const store = useStreakByteStore.getState();

    // Wrong spot placement
    store.placeNetworkDevice('switch', 'pc');
    expect(useStreakByteStore.getState().net.bad).toBe(1);
    expect(useStreakByteStore.getState().net.message).toContain('Workstation PC belongs on the Workstation PC slot');

    // Place all 4 topology devices
    expect(store.placeNetworkDevice('router', 'router')).toBe(true);
    expect(store.placeNetworkDevice('switch', 'switch')).toBe(true);
    expect(store.placeNetworkDevice('pc', 'pc')).toBe(true);
    expect(store.placeNetworkDevice('laptop', 'laptop')).toBe(true);

    // Wrong cable on WAN vs LAN
    expect(store.wireNetworkLink('wan', 'eth')).toBe(false);
    expect(useStreakByteStore.getState().net.message).toContain('Fiber or Coax');
    expect(store.wireNetworkLink('wan', 'fiber')).toBe(true);

    expect(store.wireNetworkLink('uplink', 'fiber')).toBe(false);
    expect(store.wireNetworkLink('uplink', 'eth')).toBe(true);
    expect(store.wireNetworkLink('pc', 'eth')).toBe(true);
    expect(store.wireNetworkLink('laptop', 'eth')).toBe(true);

    // Save PC config
    useStreakByteStore.getState().openNetworkConfig('pc');
    expect(
      useStreakByteStore.getState().saveNetworkConfig({
        ip: '192.168.1.10',
        mask: '255.255.255.0',
        gw: '192.168.1.1',
      }),
    ).toBe(true);

    // Invalid IP, mask, gateway on laptop
    useStreakByteStore.getState().openNetworkConfig('laptop');
    let ok = useStreakByteStore.getState().saveNetworkConfig({
      ip: '192.168.1.1',
      mask: '255.255.0.0',
      gw: '10.0.0.1',
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
    });
    expect(ok).toBe(false);
    expect(useStreakByteStore.getState().net.errors.ip).toContain('already uses');

    // Valid laptop config + ping check
    ok = useStreakByteStore.getState().saveNetworkConfig({
      ip: '192.168.1.20',
      mask: '255.255.255.0',
      gw: '192.168.1.1',
    });
    expect(ok).toBe(true);
    expect(useStreakByteStore.getState().net.openDevice).toBeNull();
    expect(useStreakByteStore.getState().net.cfg.laptop?.ip).toBe('192.168.1.20');
    expect(useStreakByteStore.getState().runNetworkPing()).toBe(true);
    expect(useStreakByteStore.getState().net.pingPassed).toBe(true);
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

  it('supports onboarding track selection, setSelectedTracks, and real streak/XP updates', async () => {
    useStreakByteStore.getState().setAuthUser({
      id: 'u-1',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
    });

    await useStreakByteStore.getState().completeOnboarding(['net']);
    let state = useStreakByteStore.getState();
    expect(state.profileSettings.onboardingCompleted).toBe(true);
    expect(state.profileSettings.selectedTracks).toEqual(['net']);
    expect(state.track).toBe('net');
    expect(state.view).toBe('dashboard');

    useStreakByteStore.getState().setSelectedTracks(['hw']);
    state = useStreakByteStore.getState();
    expect(state.profileSettings.selectedTracks).toEqual(['hw']);
    expect(state.track).toBe('hw');

    useStreakByteStore.getState().recordLessonResult('hw-1', 4, 4);
    state = useStreakByteStore.getState();
    expect(state.completions).toHaveLength(1);
    expect(state.streak.current).toBe(1);
  });

  it('triggers levelUpEvent when XP crosses 300 and clears it with dismissLevelUp', () => {
    useStreakByteStore.getState().recordLessonResult('hw-1', 4, 4); // +110 XP
    useStreakByteStore.getState().recordLessonResult('hw-2', 4, 4); // +110 XP (220)
    expect(useStreakByteStore.getState().levelUpEvent).toBeNull();

    useStreakByteStore.getState().recordLessonResult('hw-3', 4, 4); // +120 XP (340 -> Level 2)
    expect(useStreakByteStore.getState().levelUpEvent).toMatchObject({
      level: 2,
      title: 'Beginner',
    });

    useStreakByteStore.getState().dismissLevelUp();
    expect(useStreakByteStore.getState().levelUpEvent).toBeNull();
  });

  it('tracks daily quest completion and awards XP once per claim', () => {
    useStreakByteStore.getState().claimDailyQuest('daily-buddy');
    expect(useStreakByteStore.getState().labBonusXp).toBe(0);

    useStreakByteStore.getState().sendChatMessage('Explain the RAM key notch');
    useStreakByteStore.getState().claimDailyQuest('daily-buddy');
    expect(useStreakByteStore.getState().labBonusXp).toBe(25);

    // Double-claim is ignored
    useStreakByteStore.getState().claimDailyQuest('daily-buddy');
    expect(useStreakByteStore.getState().labBonusXp).toBe(25);
  });

  it('syncs avatarUrl and profileSettings on setAuthUser and loadAuthUser', async () => {
    const googleUser = {
      id: 'g-123',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      avatarUrl: 'https://lh3.googleusercontent.com/ada',
    };

    useStreakByteStore.getState().setAuthUser(googleUser);
    let state = useStreakByteStore.getState();
    expect(state.authUser).toEqual(googleUser);
    expect(state.profileSettings.displayName).toBe('Ada Lovelace');
    expect(state.profileSettings.email).toBe('ada@example.com');

    useStreakByteStore.getState().resetAll();
    const spy = vi.spyOn(services.auth, 'currentUser').mockResolvedValue(googleUser);
    try {
      await useStreakByteStore.getState().loadAuthUser();
      state = useStreakByteStore.getState();
      expect(state.authUser).toEqual(googleUser);
      expect(state.profileSettings.displayName).toBe('Ada Lovelace');
      expect(state.profileSettings.email).toBe('ada@example.com');
    } finally {
      spy.mockRestore();
    }
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
    expect(first?.questions.length).toBe(15);
    expect(new Set(first?.questions.map((q) => q.id)).size).toBe(15);
    expect(first?.questions.every((q) => q.id.startsWith('hw-3-'))).toBe(true);
    expect(first?.questions.every((q) => q.choices.length === 4)).toBe(true);

    useStreakByteStore.getState().selectQuizChoice(1);
    useStreakByteStore.getState().syncFromHash('#quiz/hw-3');
    expect(useStreakByteStore.getState().quiz?.selected).toBe(1);
  });

  it('draws a new set after leaving the quiz and opening it again', () => {
    useStreakByteStore.getState().navigate('quiz/hw-3');
    const first = useStreakByteStore.getState().quiz;
    useStreakByteStore.getState().selectQuizChoice(1);
    useStreakByteStore.getState().navigate('curriculum');
    useStreakByteStore.getState().navigate('quiz/hw-3');
    const second = useStreakByteStore.getState().quiz;
    expect(second).not.toBe(first);
    expect(second?.selected).toBeNull();
    expect(second?.index).toBe(0);
  });

  it('falls back to the curriculum for an unknown lesson key', () => {
    useStreakByteStore.getState().syncFromHash('#quiz/nope-9');
    expect(useStreakByteStore.getState().view).toBe('curriculum');
    expect(useStreakByteStore.getState().quiz).toBeNull();
  });

  it('finishes with a real score, saves missed topics, and goes to Lesson Complete', () => {
    useStreakByteStore.getState().syncFromHash('#quiz/hw-3');

    for (let i = 0; i < 15; i += 1) {
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
    expect(state.completion?.partsValue).toBe('1 / 15');
    expect(state.completion?.accuracy).toBe('7%');
    expect(state.completion?.xp).toBe('+8'); // 120 XP lesson * 1/15
    expect(state.completion?.review.length).toBe(14);
    expect(state.completion?.next[0]).toBe('Lesson 4: Storage');
  });

  it('captures lastMistake on wrong quiz answers and clears it on a correct answer', () => {
    useStreakByteStore.getState().syncFromHash('#quiz/hw-3');
    const quiz = useStreakByteStore.getState().quiz!;
    const q = quiz.questions[0];
    const wrongChoice = (q.correctIndex + 1) % 4;

    useStreakByteStore.getState().selectQuizChoice(wrongChoice);
    useStreakByteStore.getState().submitQuizAnswer();
    expect(useStreakByteStore.getState().lastMistake?.prompt).toContain('Explain why');

    useStreakByteStore.getState().nextQuizQuestion();
    const q2 = useStreakByteStore.getState().quiz!.questions[1];
    useStreakByteStore.getState().selectQuizChoice(q2.correctIndex);
    useStreakByteStore.getState().submitQuizAnswer();
    expect(useStreakByteStore.getState().lastMistake).toBeNull();
  });

  it('restores a broken streak within the restore window via restoreCurrentStreak', async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const brokenState = {
      current: 4,
      longest: 6,
      lastActiveDay: localDayString(twoDaysAgo),
      restoresLeft: 1,
    };

    const spy = vi.spyOn(services.progress, 'restoreStreakServer').mockResolvedValue({
      current: 5,
      longest: 6,
      lastActiveDay: localDayString(),
      restoresLeft: 0,
    });
    useStreakByteStore.setState({ streak: brokenState });
    try {
      await useStreakByteStore.getState().restoreCurrentStreak();
      expect(spy).toHaveBeenCalledWith(localDayString());
      expect(useStreakByteStore.getState().streak.current).toBe(5);
      expect(useStreakByteStore.getState().streak.restoresLeft).toBe(0);
    } finally {
      spy.mockRestore();
    }
  });

  it('queues offline writes and flushes them automatically when online returns', async () => {
    useStreakByteStore.getState().setAuthUser({
      id: 'u-1',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
    });
    useStreakByteStore.getState().setOnlineStatus(false);

    const saveSpy = vi.spyOn(services.progress, 'saveLessonCompletion').mockResolvedValue();
    const streakSpy = vi.spyOn(services.progress, 'saveStreak').mockResolvedValue();
    try {
      useStreakByteStore.getState().recordLessonResult('hw-1', 4, 4);
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(useStreakByteStore.getState().pendingSyncCount).toBe(2);

      useStreakByteStore.getState().setOnlineStatus(true);
      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(useStreakByteStore.getState().pendingSyncCount).toBe(0);
    } finally {
      saveSpy.mockRestore();
      streakSpy.mockRestore();
    }
  });

  it('buys streak restores with XP and refuses when XP is below 200', async () => {
    useStreakByteStore.getState().recordLessonResult('hw-1', 4, 4); // 110 XP
    await useStreakByteStore.getState().buyStreakRestore();
    expect(useStreakByteStore.getState().streak.restoresLeft).toBe(1);
    expect(useStreakByteStore.getState().xpSpent).toBe(0);

    useStreakByteStore.getState().recordLessonResult('hw-2', 4, 4); // 220 XP total
    await useStreakByteStore.getState().buyStreakRestore();
    expect(useStreakByteStore.getState().streak.restoresLeft).toBe(2);
    expect(useStreakByteStore.getState().xpSpent).toBe(200);
  });

  it('supports creating and finishing a live 1v1 duel room', async () => {
    useStreakByteStore.getState().setAuthUser({
      id: 'u-1',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
    });
    const fakeRoom = {
      id: 'd-1',
      code: 'DUEL99',
      classroomId: null,
      track: 'hw' as const,
      wagerXp: 0,
      wagerMode: 'xp' as const,
      status: 'waiting' as const,
      questionIds: ['hw-1-1', 'hw-1-2'],
      hostId: 'u-1',
      hostName: 'Ada Lovelace',
      hostReady: false,
      hostScore: null,
      hostTimeMs: null,
      guestId: null,
      guestName: null,
      guestReady: false,
      guestScore: null,
      guestTimeMs: null,
      startedAt: null,
      winnerId: null,
      settled: false,
      bountyXp: 0,
      fullByteBonusXp: 25,
      shieldAwarded: false,
      shieldConsumed: false,
    };
    const createSpy = vi.spyOn(services.duel, 'createDuel').mockResolvedValue(fakeRoom);
    const submitSpy = vi.spyOn(services.duel, 'submitResult').mockResolvedValue({
      ...fakeRoom,
      status: 'finished',
      hostScore: 2,
      hostTimeMs: 9000,
      winnerId: 'u-1',
      settled: true,
    });
    const syncSpy = vi.spyOn(services.progress, 'syncLeaderboardEntry').mockResolvedValue();
    try {
      const ok = await useStreakByteStore
        .getState()
        .createDuelRoom({ track: 'hw', wagerXp: 0, classroomId: null });
      expect(ok).toBe(true);
      expect(createSpy.mock.calls[0][0].questionIds).toHaveLength(8);
      expect(createSpy.mock.calls[0][0].questionIds.some((id) => id.startsWith('quiz:hw-'))).toBe(true);
      expect(useStreakByteStore.getState().activeDuel?.code).toBe('DUEL99');

      await useStreakByteStore.getState().submitDuelResult(2, 9000);
      expect(useStreakByteStore.getState().activeDuel?.winnerId).toBe('u-1');
      expect(useStreakByteStore.getState().dailyActivity.arenaDuelsFinished).toBe(1);

      useStreakByteStore.getState().claimDailyQuest('daily-arena');
      expect(useStreakByteStore.getState().labBonusXp).toBe(50);
    } finally {
      createSpy.mockRestore();
      submitSpy.mockRestore();
      syncSpy.mockRestore();
    }
  });

  it('runs a local bot test duel solo without hitting Supabase', async () => {
    const submitSpy = vi.spyOn(services.duel, 'submitResult');
    try {
      useStreakByteStore.getState().startBotTestDuel('mixed');
      const duel = useStreakByteStore.getState().activeDuel;
      expect(duel?.status).toBe('active');
      expect(duel?.questionIds).toHaveLength(8);
      expect(duel?.questionIds.some((id) => id.startsWith('gen:'))).toBe(true);
      expect(duel?.questionIds.some((id) => id.startsWith('arena:'))).toBe(true);
      expect(duel?.questionIds.some((id) => id.startsWith('quiz:'))).toBe(true);

      await useStreakByteStore.getState().submitDuelResult(7, 12000);
      expect(useStreakByteStore.getState().activeDuel?.status).toBe('finished');
      expect(submitSpy).not.toHaveBeenCalled();
      expect(useStreakByteStore.getState().dailyActivity.arenaDuelsFinished).toBe(0);

      await useStreakByteStore.getState().cancelOrForfeitDuel();
      expect(useStreakByteStore.getState().activeDuel).toBeNull();
    } finally {
      submitSpy.mockRestore();
    }
  });

  it('blocks navigation and Solo Practice tab during an active duel until finished or forfeited', async () => {
    useStreakByteStore.getState().navigate('arena');
    useStreakByteStore.getState().startBotTestDuel('mixed');

    expect(useStreakByteStore.getState().view).toBe('arena');
    expect(useStreakByteStore.getState().arenaTab).toBe('duel');

    useStreakByteStore.getState().navigate('dashboard');
    expect(useStreakByteStore.getState().view).toBe('arena');

    useStreakByteStore.getState().syncFromHash('#curriculum');
    expect(useStreakByteStore.getState().view).toBe('arena');

    useStreakByteStore.getState().setArenaTab('practice');
    expect(useStreakByteStore.getState().arenaTab).toBe('duel');

    await useStreakByteStore.getState().cancelOrForfeitDuel();
    useStreakByteStore.getState().navigate('dashboard');
    expect(useStreakByteStore.getState().view).toBe('dashboard');
  });

  it('sets completion.nextRoute to the actual next unlocked lesson after finishing a quiz', () => {
    const finishQuiz = (key: string) => {
      useStreakByteStore.getState().syncFromHash(`#quiz/${key}`);
      for (let i = 0; i < 15; i += 1) {
        const q = useStreakByteStore.getState().quiz;
        if (!q) break;
        const currentQ = q.questions[q.index];
        useStreakByteStore.getState().selectQuizChoice(currentQ.correctIndex);
        useStreakByteStore.getState().submitQuizAnswer();
        useStreakByteStore.getState().nextQuizQuestion();
      }
    };

    finishQuiz('hw-1');
    expect(useStreakByteStore.getState().view).toBe('complete');
    expect(useStreakByteStore.getState().completion?.nextRoute).toBe('learn/hw-2');

    // Finish hw-5 while hw-2..4 remain incomplete -> hw-6 stays locked -> falls back to curriculum
    finishQuiz('hw-5');
    expect(useStreakByteStore.getState().completion?.nextRoute).toBe('curriculum');

    // Complete remaining lessons so hw-6 unlocks, then finish hw-6 -> no following lesson -> curriculum
    for (const key of ['hw-2', 'hw-3', 'hw-4']) {
      useStreakByteStore.getState().recordLessonResult(key, 4, 4);
    }
    finishQuiz('hw-6');
    expect(useStreakByteStore.getState().completion?.nextRoute).toBe('curriculum');
  });

  it('completes hw-6 in completions when finishing PC Build Lab after lessons 1-5 are done', () => {
    for (const key of ['hw-1', 'hw-2', 'hw-3', 'hw-4', 'hw-5']) {
      useStreakByteStore.getState().recordLessonResult(key, 4, 4);
    }
    const store = useStreakByteStore.getState();
    store.placePcPart('CPU', 'cpu');
    store.placePcPart('COOLER', 'cooler');
    store.placePcPart('A2', 'ram');
    store.placePcPart('B2', 'ram');
    store.placePcPart('M2', 'm2');
    store.placePcPart('PCIE', 'gpu');
    store.placePcPart('PWR', 'psu');
    useStreakByteStore.getState().completePcBuild();

    const state = useStreakByteStore.getState();
    expect(state.completions.some((c) => c.lessonKey === 'hw-6')).toBe(true);
    expect(state.completion?.nextRoute).toBe('curriculum');
  });

  it('counts down from chosen timed session length and blocks actions on time out', () => {
    const store = useStreakByteStore.getState();
    store.setSetupMode('timed');
    store.setSetupLength('10');
    store.openSetup('pc');
    store.startSessionFromModal();

    expect(useStreakByteStore.getState().labSessionMode).toBe('timed');
    expect(useStreakByteStore.getState().lessonSeconds).toBe(600);
    expect(useStreakByteStore.getState().labTimedOut).toBe(false);

    useStreakByteStore.getState().tickLessonTimer();
    expect(useStreakByteStore.getState().lessonSeconds).toBe(599);

    useStreakByteStore.setState({ lessonSeconds: 1 });
    useStreakByteStore.getState().tickLessonTimer();
    expect(useStreakByteStore.getState().lessonSeconds).toBe(0);
    expect(useStreakByteStore.getState().labTimedOut).toBe(true);
    expect(useStreakByteStore.getState().placePcPart('CPU', 'cpu')).toBe(false);

    useStreakByteStore.getState().retryTimedLab();
    expect(useStreakByteStore.getState().labTimedOut).toBe(false);
    expect(useStreakByteStore.getState().lessonSeconds).toBe(600);
    expect(useStreakByteStore.getState().placePcPart('CPU', 'cpu')).toBe(true);
  });

  it('charges 25 XP for PcBuildLab and NetworkBuildLab hints and enforces XP/mode/completion guards', () => {
    // 0 XP blocks paid hint without charging
    useStreakByteStore.getState().triggerPcHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(0);
    expect(useStreakByteStore.getState().toastMessage).toContain('25 XP');

    useStreakByteStore.getState().triggerNetworkHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(0);

    // Grant 100 XP -> first PC hint deducts 25 XP, second click on same step costs 0 XP
    useStreakByteStore.setState({ labBonusXp: 100 });
    useStreakByteStore.getState().triggerPcHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(25);
    expect(useStreakByteStore.getState().pc.message).toContain('Install the CPU');

    useStreakByteStore.getState().triggerPcHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(25);

    // Advancing to CPU cooler step unlocks next hint for 25 XP
    useStreakByteStore.getState().placePcPart('CPU', 'cpu');
    useStreakByteStore.getState().triggerPcHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(50);
    expect(useStreakByteStore.getState().pc.message).toContain('Mount the CPU cooler');

    // Network hint deducts 25 XP once per step, and stays locked until Router is placed
    useStreakByteStore.getState().triggerNetworkHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(75);
    expect(useStreakByteStore.getState().net.message).toContain('Router slot');

    useStreakByteStore.getState().triggerNetworkHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(75);

    useStreakByteStore.getState().placeNetworkDevice('router', 'router');
    useStreakByteStore.getState().triggerNetworkHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(100);
    expect(useStreakByteStore.getState().net.message).toContain('8-Port Switch');

    // All steps complete -> no XP charged
    useStreakByteStore.setState((s) => ({
      pc: {
        ...s.pc,
        cpu: true,
        cooler: true,
        ram: { A2: true, B2: true },
        m2: true,
        gpu: true,
        psu: true,
      },
      net: {
        ...s.net,
        placed: { router: true, switch: true, pc: true, laptop: true },
        links: { wan: 'fiber', uplink: 'eth', pc: 'eth', laptop: 'eth' },
        savedDevices: { pc: true, laptop: true },
        openDevice: null,
      },
    }));
    useStreakByteStore.getState().triggerPcHint();
    useStreakByteStore.getState().triggerNetworkHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(100);

    // Timed mode and timed-out states ignore hint purchases
    useStreakByteStore.getState().resetAll();
    useStreakByteStore.setState({ labBonusXp: 100, labSessionMode: 'timed' });
    useStreakByteStore.getState().triggerPcHint();
    useStreakByteStore.getState().triggerNetworkHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(0);

    useStreakByteStore.setState({ labSessionMode: 'guided', labTimedOut: true });
    useStreakByteStore.getState().triggerPcHint();
    useStreakByteStore.getState().triggerNetworkHint();
    expect(useStreakByteStore.getState().xpSpent).toBe(0);
  });

  it('refuses to complete PC Build Lab or Network Build Lab when required steps are unfinished', () => {
    useStreakByteStore.getState().navigate('lesson/pc');
    useStreakByteStore.getState().completePcBuild();
    expect(useStreakByteStore.getState().view).toBe('lesson');
    expect(useStreakByteStore.getState().labBonusXp).toBe(0);
    expect(useStreakByteStore.getState().pc.bad).toBe(1);
    expect(useStreakByteStore.getState().pc.message).toContain('0/7 parts installed');

    // Partial build also fails
    useStreakByteStore.getState().placePcPart('CPU', 'cpu');
    useStreakByteStore.getState().completePcBuild();
    expect(useStreakByteStore.getState().view).toBe('lesson');
    expect(useStreakByteStore.getState().pc.message).toContain('1/7 parts installed');

    // Network lab fails if devices/cables/IPs aren't finished yet
    useStreakByteStore.getState().navigate('lesson/network');
    useStreakByteStore.getState().completeNetworkBuild();
    expect(useStreakByteStore.getState().view).toBe('lesson');
    expect(useStreakByteStore.getState().labBonusXp).toBe(0);
    expect(useStreakByteStore.getState().net.message).toContain('place Router');
  });

  it('disables and closes Study Buddy during quizzes, hands-on lab exams, and active 1v1 Arena fights', () => {
    const replySpy = vi.spyOn(services.studyBuddy, 'reply');

    // 1. Active 1v1 Arena duel locks & auto-closes chat
    useStreakByteStore.getState().setChatOpen(true);
    expect(useStreakByteStore.getState().chat.open).toBe(true);
    useStreakByteStore.getState().startBotTestDuel('hw');
    expect(useStreakByteStore.getState().chat.open).toBe(false);

    useStreakByteStore.getState().setChatOpen(true);
    expect(useStreakByteStore.getState().chat.open).toBe(false);
    expect(useStreakByteStore.getState().toastMessage).toContain('1v1 Arena fight');
    useStreakByteStore.getState().sendChatMessage('What slot does RAM go in?');
    expect(replySpy).not.toHaveBeenCalled();
    expect(useStreakByteStore.getState().dailyActivity.studyBuddyMessages).toBe(0);

    // Finish duel -> Study Buddy unlocks again
    useStreakByteStore.setState((s) => ({
      activeDuel: s.activeDuel ? { ...s.activeDuel, status: 'finished' } : null,
    }));

    // 2. Curriculum quiz auto-closes & blocks Study Buddy
    useStreakByteStore.getState().setChatOpen(true);
    expect(useStreakByteStore.getState().chat.open).toBe(true);
    useStreakByteStore.getState().navigate('quiz/hw-3');
    expect(useStreakByteStore.getState().chat.open).toBe(false);
    useStreakByteStore.getState().setChatOpen(true);
    expect(useStreakByteStore.getState().chat.open).toBe(false);
    expect(useStreakByteStore.getState().toastMessage).toContain('quizzes');
    useStreakByteStore.getState().sendChatMessage('Which slot?');
    expect(replySpy).not.toHaveBeenCalled();

    // 3. Hands-on lab exam (PC / Network) auto-closes & blocks Study Buddy
    useStreakByteStore.getState().navigate('dashboard');
    useStreakByteStore.getState().setChatOpen(true);
    expect(useStreakByteStore.getState().chat.open).toBe(true);
    useStreakByteStore.getState().navigate('lesson/pc');
    expect(useStreakByteStore.getState().chat.open).toBe(false);
    useStreakByteStore.getState().setChatOpen(true);
    expect(useStreakByteStore.getState().chat.open).toBe(false);
    expect(useStreakByteStore.getState().toastMessage).toContain('lab exams');
    useStreakByteStore.getState().sendChatMessage('Help me build');
    expect(replySpy).not.toHaveBeenCalled();

    // 4. Allowed on non-exam screens (e.g. dashboard / learn)
    useStreakByteStore.getState().navigate('dashboard');
    useStreakByteStore.getState().setChatOpen(true);
    expect(useStreakByteStore.getState().chat.open).toBe(true);
    useStreakByteStore.getState().sendChatMessage('Explain the RAM key notch');
    expect(replySpy).toHaveBeenCalledTimes(1);
    replySpy.mockRestore();
  });
});
