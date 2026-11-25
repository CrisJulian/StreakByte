import { useEffect, useMemo, useRef, useState } from 'react';
import type { DuelSubscription } from '../application/ports';
import { playSfx } from '../audio/soundEffects';
import { services } from '../composition';
import { LESSON_XP_BY_KEY } from '../data/curriculum';
import { formatXp } from '../data/leaderboard';
import { ARENA_SCENARIO_BY_ID } from '../data/arenaScenarios';
import { getQuizQuestionById } from '../data/quizBank';
import { resolveArenaQuestion } from '../domain/rules/arenaQuestions';
import {
  calculateStreakSpeedBonusMs,
  canAffordWager,
  canEnterStreakWager,
  DUEL_QUESTION_COUNT,
  DUEL_WAGER_OPTIONS,
  formatDuelTime,
  FULL_BYTE_BONUS_XP,
  MAX_STREAK_SHIELDS,
  STREAK_WAGER_REWARD_XP,
  type DuelTrack,
  type DuelWagerMode,
} from '../domain/rules/duel';
import { calculateTotalXp, effectiveStreak, localDayString } from '../domain/rules/xp';
import { LOCAL_TEST_DUEL_ID, useStreakByteStore } from '../store/useStreakByteStore';
import { PracticeView } from './PracticeView';

const TRACK_LABELS: Record<DuelTrack, string> = {
  hw: 'Hardware',
  net: 'Networking',
  mixed: 'Mixed',
};

function BinaryByteBar({ total, bits }: { total: number; bits: readonly (0 | 1)[] }) {
  return (
    <div className="grid grid-cols-8 gap-1 mt-2" aria-hidden="true">
      {Array.from({ length: total }, (_, idx) => {
        const bit = bits[idx];
        return (
          <span
            key={idx}
            className={`h-6 rounded-md border text-xs font-mono font-bold grid place-items-center transition-colors ${
              bit === 1
                ? 'border-green bg-green/20 text-green'
                : bit === 0
                  ? 'border-red/60 bg-red/15 text-red'
                  : 'border-line bg-panel2 text-muted'
            }`}
          >
            {bit === undefined ? '_' : bit}
          </span>
        );
      })}
    </div>
  );
}

export function ArenaView() {
  const arenaTab = useStreakByteStore((s) => s.arenaTab);
  const setArenaTab = useStreakByteStore((s) => s.setArenaTab);
  const authUser = useStreakByteStore((s) => s.authUser);
  const isGuest = useStreakByteStore((s) => s.isGuest);
  const completions = useStreakByteStore((s) => s.completions);
  const streak = useStreakByteStore((s) => s.streak);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
  const soundEnabled = useStreakByteStore((s) => s.profileSettings.soundEffects);
  const classrooms = useStreakByteStore((s) => s.classrooms);
  const arenaStats = useStreakByteStore((s) => s.arenaStats);
  const activeDuel = useStreakByteStore((s) => s.activeDuel);
  const openClassroomDuels = useStreakByteStore((s) => s.openClassroomDuels);
  const opponentProgress = useStreakByteStore((s) => s.opponentProgress);
  const refreshClassroomDuels = useStreakByteStore((s) => s.refreshClassroomDuels);
  const createDuelRoom = useStreakByteStore((s) => s.createDuelRoom);
  const startBotTestDuel = useStreakByteStore((s) => s.startBotTestDuel);
  const joinDuelRoom = useStreakByteStore((s) => s.joinDuelRoom);
  const setDuelReady = useStreakByteStore((s) => s.setDuelReady);
  const submitDuelResult = useStreakByteStore((s) => s.submitDuelResult);
  const cancelOrForfeitDuel = useStreakByteStore((s) => s.cancelOrForfeitDuel);
  const setActiveDuel = useStreakByteStore((s) => s.setActiveDuel);
  const setOpponentProgress = useStreakByteStore((s) => s.setOpponentProgress);
  const showToast = useStreakByteStore((s) => s.showToast);

  const availableXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const activeStreakDays = effectiveStreak(streak, localDayString());
  const canStreakWager = canEnterStreakWager(activeStreakDays);

  // Matchmaking form state
  const [track, setTrack] = useState<DuelTrack>('mixed');
  const [wagerMode, setWagerMode] = useState<DuelWagerMode>('xp');
  const [wagerXp, setWagerXp] = useState<number>(0);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [busy, setBusy] = useState(false);

  // Live sprint local state (reset whenever activeDuel.id changes)
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bits, setBits] = useState<Array<0 | 1>>([]);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [maxAnswerStreak, setMaxAnswerStreak] = useState(0);
  const [pickedChoice, setPickedChoice] = useState<number | null>(null);
  const [localDone, setLocalDone] = useState(false);
  const [localElapsedMs, setLocalElapsedMs] = useState<number | null>(null);
  const [localBonusMs, setLocalBonusMs] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const subRef = useRef<DuelSubscription | null>(null);

  const isTestDuel = activeDuel?.id === LOCAL_TEST_DUEL_ID;

  useEffect(() => {
    setQIndex(0);
    setScore(0);
    setBits([]);
    setAnswerStreak(0);
    setMaxAnswerStreak(0);
    setPickedChoice(null);
    setLocalDone(false);
    setLocalElapsedMs(null);
    setLocalBonusMs(0);
    setOpponentProgress(null);
  }, [activeDuel?.id, activeDuel?.startedAt, setOpponentProgress]);

  useEffect(() => {
    if (wagerMode === 'xp' && !canAffordWager(availableXp, wagerXp)) {
      setWagerXp(0);
    }
    if (wagerMode === 'streak' && !canStreakWager) {
      setWagerMode('xp');
    }
  }, [availableXp, wagerXp, wagerMode, canStreakWager]);

  useEffect(() => {
    if (arenaTab === 'duel' && !isGuest && authUser && !activeDuel && classrooms.length > 0) {
      void refreshClassroomDuels();
    }
  }, [arenaTab, isGuest, authUser, activeDuel, classrooms.length, refreshClassroomDuels]);

  // Realtime subscription + 3s safety poll while in a real waiting/active duel, or local bot pacing for Test Duel
  useEffect(() => {
    if (!activeDuel) {
      subRef.current = null;
      return undefined;
    }

    if (activeDuel.id === LOCAL_TEST_DUEL_ID) {
      subRef.current = null;
      if (activeDuel.status !== 'active') return undefined;

      let step = 0;
      const total = activeDuel.questionIds.length;
      const botBits: Array<0 | 1> = [];
      let botScore = 0;
      let botStreak = 0;

      const timer = setInterval(() => {
        if (step >= total) return;
        step += 1;
        const bit: 0 | 1 = step % 4 === 0 ? 0 : 1;
        botBits.push(bit);
        if (bit === 1) {
          botScore += 1;
          botStreak += 1;
        } else {
          botStreak = 0;
        }
        setOpponentProgress({
          userId: 'byte-bot',
          answered: step,
          total,
          score: botScore,
          bits: [...botBits],
          answerStreak: botStreak,
          finished: step >= total,
        });
      }, 2400);

      return () => clearInterval(timer);
    }

    if (isGuest || !authUser) {
      subRef.current = null;
      return undefined;
    }

    const duelId = activeDuel.id;
    const sub = services.duel.subscribeDuel(duelId, {
      onRoomUpdate: (room) => {
        setActiveDuel(room);
      },
      onOpponentProgress: (progress) => {
        if (progress.userId !== authUser.id) {
          setOpponentProgress(progress);
        }
      },
    });
    subRef.current = sub;

    let timer: ReturnType<typeof setInterval> | null = null;
    if (activeDuel.status === 'waiting' || activeDuel.status === 'active') {
      timer = setInterval(() => {
        void services.duel
          .getDuel(duelId)
          .then((room) => {
            if (room) setActiveDuel(room);
          })
          .catch(() => undefined);
      }, 3000);
    }

    return () => {
      sub.unsubscribe();
      subRef.current = null;
      if (timer) clearInterval(timer);
    };
  }, [activeDuel?.id, activeDuel?.status, activeDuel?.startedAt, activeDuel?.questionIds.length, authUser, isGuest, setActiveDuel, setOpponentProgress]);

  // Stopwatch + countdown ticker during active duel
  useEffect(() => {
    if (activeDuel?.status !== 'active') return undefined;
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 100);
    return () => clearInterval(id);
  }, [activeDuel?.status, activeDuel?.startedAt]);

  const duelQuestions = useMemo(
    () =>
      (activeDuel?.questionIds ?? [])
        .map((id) => resolveArenaQuestion(id, ARENA_SCENARIO_BY_ID, getQuizQuestionById))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [activeDuel?.questionIds],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    await createDuelRoom({
      track,
      wagerXp: wagerMode === 'streak' ? 0 : wagerXp,
      wagerMode,
      classroomId: selectedClassroomId || null,
    });
    setBusy(false);
  };

  const handleJoin = async (code: string) => {
    if (busy || !code.trim()) return;
    setBusy(true);
    const ok = await joinDuelRoom(code);
    if (ok) {
      setJoinCodeInput('');
      subRef.current?.notifySync();
    }
    setBusy(false);
  };

  const handleToggleReady = async () => {
    if (!activeDuel || !authUser || busy) return;
    const isHost = activeDuel.hostId === authUser.id;
    const currentlyReady = isHost ? activeDuel.hostReady : activeDuel.guestReady;
    setBusy(true);
    await setDuelReady(!currentlyReady);
    subRef.current?.notifySync();
    setBusy(false);
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).catch(() => undefined);
    }
    showToast(`Copied room code ${code}`);
  };

  const handlePickAnswer = (choiceIdx: number) => {
    if (!activeDuel || pickedChoice !== null || localDone) return;
    const q = duelQuestions[qIndex];
    if (!q) return;
    const playerId = authUser?.id || 'local-guest';

    const correct = choiceIdx === q.correctIndex;
    const nextScore = score + (correct ? 1 : 0);
    const nextBits: Array<0 | 1> = [...bits, correct ? 1 : 0];
    const nextAnswerStreak = correct ? answerStreak + 1 : 0;
    const nextMaxAnswerStreak = Math.max(maxAnswerStreak, nextAnswerStreak);
    const nextAnswered = qIndex + 1;
    const isLast = nextAnswered >= duelQuestions.length;

    setPickedChoice(choiceIdx);
    setScore(nextScore);
    setBits(nextBits);
    setAnswerStreak(nextAnswerStreak);
    setMaxAnswerStreak(nextMaxAnswerStreak);

    if (!correct) {
      playSfx('error', { enabled: soundEnabled });
    } else if (nextAnswerStreak >= 2) {
      playSfx('combo', { enabled: soundEnabled, combo: nextAnswerStreak });
    } else {
      playSfx('snap', { enabled: soundEnabled });
    }

    subRef.current?.sendProgress({
      userId: playerId,
      answered: nextAnswered,
      total: duelQuestions.length,
      score: nextScore,
      bits: nextBits,
      answerStreak: nextAnswerStreak,
      finished: isLast,
    });

    const startMs = activeDuel.startedAt ? Date.parse(activeDuel.startedAt) : Date.now();
    const rawElapsedMs = Math.max(500, Date.now() - startMs);
    const bonusMs = calculateStreakSpeedBonusMs(nextMaxAnswerStreak);
    const effectiveElapsedMs = Math.max(500, rawElapsedMs - bonusMs);

    setTimeout(() => {
      if (isLast) {
        setLocalDone(true);
        setLocalElapsedMs(effectiveElapsedMs);
        setLocalBonusMs(bonusMs);
        void submitDuelResult(nextScore, effectiveElapsedMs).then(() => {
          subRef.current?.notifySync();
        });
      } else {
        setQIndex(nextAnswered);
        setPickedChoice(null);
      }
    }, 260);
  };

  const classroomNameById = useMemo(
    () => new Map(classrooms.map((c) => [c.id, c.name])),
    [classrooms],
  );

  const playerId = authUser?.id || 'local-guest';
  const isHost = Boolean(activeDuel && activeDuel.hostId === playerId);
  const opponentName = activeDuel
    ? isHost
      ? activeDuel.guestName || 'Opponent'
      : activeDuel.hostName
    : 'Opponent';
  const myRoomReady = activeDuel ? (isHost ? activeDuel.hostReady : activeDuel.guestReady) : false;

  const startMs = activeDuel?.startedAt ? Date.parse(activeDuel.startedAt) : nowMs;
  const countdownSec = Math.max(0, Math.ceil((startMs - nowMs) / 1000));
  const sprintElapsedMs = Math.max(0, nowMs - startMs);
  const liveBonusMs = calculateStreakSpeedBonusMs(maxAnswerStreak);

  return (
    <div>
      <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
        <div>
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
            Arena
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[1.0625rem]">
            {arenaTab === 'duel'
              ? 'Race 8-bit Bytes 1v1 on accuracy and speed. Build Win Streaks and earn Streak Shields.'
              : 'Review missed topics and keep your lessons sharp.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className="num inline-flex items-center px-3 py-2 rounded-xl border border-line bg-bg text-xs font-bold text-cyan"
            title="Available XP to wager"
          >
            {formatXp(availableXp)} XP available
          </span>

          <div
            role="group"
            aria-label="Arena mode"
            className="inline-flex p-1 border border-line rounded-xl bg-bg gap-1"
          >
            <button
              type="button"
              aria-pressed={arenaTab === 'duel'}
              onClick={() => setArenaTab('duel')}
              className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                arenaTab === 'duel'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              Live 1v1 Duels
            </button>
            <button
              type="button"
              aria-pressed={arenaTab === 'practice'}
              onClick={() => setArenaTab('practice')}
              className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                arenaTab === 'practice'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              Solo Practice
            </button>
          </div>
        </div>
      </div>

      {arenaTab === 'duel' && !isGuest && authUser && (
        <section
          aria-label="Your Arena record"
          className="grid grid-cols-4 max-[760px]:grid-cols-2 gap-3 mb-5"
        >
          <div className="p-3.5 rounded-2xl border border-line bg-panel">
            <small className="block text-xs font-semibold text-muted">Win Streak</small>
            <b className="num text-xl text-amber">
              {arenaStats.winStreak} {arenaStats.winStreak > 0 ? '🔥' : ''}
            </b>
          </div>
          <div
            className="p-3.5 rounded-2xl border border-line bg-panel"
            title="Streak Shields absorb 1 duel loss to save your Win Streak. Earn on Streak Breaker wins or 3-win milestones."
          >
            <small className="block text-xs font-semibold text-muted">Win Streak Shields</small>
            <b className="num text-xl text-cyan">
              {arenaStats.streakShields} / {MAX_STREAK_SHIELDS} 🛡️
            </b>
          </div>
          <div className="p-3.5 rounded-2xl border border-line bg-panel">
            <small className="block text-xs font-semibold text-muted">1v1 Record</small>
            <b className="num text-xl">
              {arenaStats.wins}W – {arenaStats.losses}L
            </b>
          </div>
          <div className="p-3.5 rounded-2xl border border-line bg-panel">
            <small className="block text-xs font-semibold text-muted">Best Win Streak</small>
            <b className="num text-xl">{arenaStats.bestStreak}</b>
          </div>
        </section>
      )}

      {arenaTab === 'practice' ? (
        <PracticeView />
      ) : (isGuest || !authUser) && !activeDuel ? (
        <section className="p-6 border border-line rounded-2xl bg-panel grid gap-4 max-w-[620px]">
          <h2 className="m-0 text-lg font-bold">Sign in with Google for Live 1v1 Duels</h2>
          <p className="m-0 text-sm text-muted">
            Guest mode runs offline and cannot connect to live 1v1 rooms or wager XP. Sign in with
            Google to challenge classmates, train in Solo Practice, or preview the 8-bit Arena
            questions in Test Mode.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => startBotTestDuel('mixed')}
              className="min-h-10 px-4 border border-cyan rounded-xl bg-cyan text-cyan-ink font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
            >
              Test 1v1 vs BYTE Bot
            </button>
            <button
              type="button"
              onClick={() => setArenaTab('practice')}
              className="min-h-10 px-4 border border-line rounded-xl bg-transparent text-ink font-semibold text-sm cursor-pointer hover:bg-panel2"
            >
              Open Solo Practice
            </button>
          </div>
        </section>
      ) : !activeDuel ? (
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] max-[960px]:grid-cols-1 gap-5 items-start">
          <form
            onSubmit={(e) => void handleCreate(e)}
            className="bg-panel border border-line rounded-2xl p-5 grid gap-4"
          >
            <div>
              <h2 className="m-0 text-lg font-bold">Create an 8-Bit 1v1 Duel</h2>
              <p className="mt-1 mb-0 text-xs text-muted">
                {DUEL_QUESTION_COUNT} questions (1 Byte). Higher score wins; fastest clock breaks
                ties. Chain 3+ right answers for -0.5s clock speed, snap a 2+ win streak for a
                Bounty + Streak Shield, or score 8/8 for +{FULL_BYTE_BONUS_XP} Full Byte XP!
              </p>
            </div>

            <div>
              <span className="block mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                Topic track
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['hw', 'net', 'mixed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={track === t}
                    onClick={() => setTrack(t)}
                    className={`min-h-10 px-3 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                      track === t
                        ? 'bg-cyan text-cyan-ink border-cyan'
                        : 'bg-bg text-ink border-line hover:border-muted'
                    }`}
                  >
                    {TRACK_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                Wager stakes
              </span>
              <div className="grid grid-cols-4 max-[640px]:grid-cols-2 gap-2">
                {DUEL_WAGER_OPTIONS.map((w) => {
                  const affordable = canAffordWager(availableXp, w);
                  const selected = wagerMode === 'xp' && wagerXp === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      disabled={!affordable}
                      aria-pressed={selected}
                      onClick={() => {
                        setWagerMode('xp');
                        setWagerXp(w);
                      }}
                      className={`min-h-10 px-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        selected
                          ? 'bg-amber text-amber-ink border-amber'
                          : 'bg-bg text-ink border-line hover:border-muted'
                      }`}
                    >
                      {w === 0 ? 'Friendly (0 XP)' : `${w} XP`}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={!canStreakWager}
                  aria-pressed={wagerMode === 'streak'}
                  onClick={() => setWagerMode('streak')}
                  className={`min-h-10 px-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    wagerMode === 'streak'
                      ? 'bg-amber text-amber-ink border-amber'
                      : 'bg-bg text-ink border-line hover:border-muted'
                  }`}
                >
                  🔥 Streak Breaker
                </button>
              </div>
              <small className="block mt-1.5 text-xs text-muted">
                {wagerMode === 'streak'
                  ? `Both players stake their Daily Streak: winner earns +${STREAK_WAGER_REWARD_XP} XP & +1 Streak Shield; loser’s Daily Streak breaks (unless saved by a Shield).`
                  : !canStreakWager
                    ? 'Finish 1 lesson today to unlock Streak Breaker wagers.'
                    : 'Choose Friendly (0 XP), stake XP, or risk your Daily Streak.'}
              </small>
            </div>

            <div>
              <label
                htmlFor="duel-scope"
                className="block mb-2 text-xs font-bold uppercase tracking-wider text-muted"
              >
                Invite scope
              </label>
              <select
                id="duel-scope"
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="w-full min-h-10 px-3 border border-line rounded-xl bg-bg text-ink text-sm focus-visible:outline-none focus-visible:border-cyan"
              >
                <option value="">Private room code only</option>
                {classrooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Classroom: {room.name} ({room.joinCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 min-h-11 px-5 rounded-xl border border-cyan bg-cyan text-cyan-ink font-bold text-sm cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
              >
                {busy ? 'Creating room…' : 'Create 1v1 Room'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => startBotTestDuel(track)}
                className="min-h-11 px-4 rounded-xl border border-line bg-bg text-ink font-semibold text-sm cursor-pointer hover:border-muted disabled:opacity-50"
              >
                Test 1v1 vs BYTE Bot
              </button>
            </div>
          </form>

          <div className="grid gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleJoin(joinCodeInput);
              }}
              className="bg-panel border border-line rounded-2xl p-5 grid gap-3"
            >
              <h2 className="m-0 text-lg font-bold">Join by Room Code</h2>
              <div className="flex gap-2">
                <input
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter 6-char code"
                  maxLength={8}
                  aria-label="Duel room code"
                  className="flex-1 min-w-0 min-h-11 px-3 border border-line rounded-xl bg-bg text-ink text-sm font-mono uppercase focus-visible:outline-none focus-visible:border-cyan"
                />
                <button
                  type="submit"
                  disabled={busy || !joinCodeInput.trim()}
                  className="min-h-11 px-4 rounded-xl border border-cyan bg-cyan text-cyan-ink text-sm font-bold cursor-pointer disabled:opacity-50"
                >
                  Join Duel
                </button>
              </div>
            </form>

            <section className="bg-panel border border-line rounded-2xl p-5 grid gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="m-0 text-lg font-bold">Classroom Challenges</h2>
                {classrooms.length > 0 && (
                  <button
                    type="button"
                    onClick={() => void refreshClassroomDuels()}
                    className="min-h-8 px-2.5 rounded-lg border border-line bg-bg text-xs font-semibold text-muted hover:text-ink cursor-pointer"
                  >
                    Refresh
                  </button>
                )}
              </div>

              {classrooms.length === 0 ? (
                <p className="m-0 text-xs text-muted">
                  Join or create a classroom in Leaderboard to see open challenges from classmates.
                </p>
              ) : openClassroomDuels.length === 0 ? (
                <p className="m-0 text-xs text-muted">
                  No open classroom duels right now. Create one and select your classroom!
                </p>
              ) : (
                <ul className="grid gap-2 m-0 p-0 list-none">
                  {openClassroomDuels.map((room) => {
                    const joinable =
                      room.wagerMode === 'streak'
                        ? canStreakWager
                        : canAffordWager(availableXp, room.wagerXp);
                    const roomLabel = room.classroomId
                      ? classroomNameById.get(room.classroomId)
                      : undefined;
                    const wagerText =
                      room.wagerMode === 'streak'
                        ? '🔥 Streak Breaker'
                        : room.wagerXp === 0
                          ? 'Friendly'
                          : `${room.wagerXp} XP wager`;
                    return (
                      <li
                        key={room.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-line bg-bg"
                      >
                        <div className="min-w-0">
                          <b className="block text-sm truncate">
                            {room.hostName} · {TRACK_LABELS[room.track]}
                          </b>
                          <small className="block text-xs text-muted">
                            {roomLabel ? `${roomLabel} · ` : ''}
                            {wagerText} · Code <code className="font-mono">{room.code}</code>
                          </small>
                        </div>
                        <button
                          type="button"
                          disabled={busy || !joinable}
                          onClick={() => void handleJoin(room.code)}
                          className="min-h-9 px-3 rounded-lg border border-cyan bg-cyan text-cyan-ink text-xs font-bold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                        >
                          Accept
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      ) : activeDuel.status === 'waiting' ? (
        <section className="bg-panel border border-line rounded-2xl p-6 grid gap-5 max-w-[680px]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {TRACK_LABELS[activeDuel.track]} · {activeDuel.questionIds.length} Bits (1 Byte) ·{' '}
                {activeDuel.wagerMode === 'streak'
                  ? '🔥 Streak Breaker Wager'
                  : activeDuel.wagerXp === 0
                    ? 'Friendly (0 XP)'
                    : `${activeDuel.wagerXp} XP Wager`}
              </span>
              <h2 className="m-0 mt-1 text-2xl font-bold tracking-wider font-mono">
                Room {activeDuel.code}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(activeDuel.code)}
              className="min-h-10 px-4 rounded-xl border border-line bg-bg text-ink text-xs font-bold cursor-pointer hover:border-muted"
            >
              Copy Code
            </button>
          </div>

          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3">
            <div className="p-4 rounded-xl border border-line bg-bg flex items-center justify-between gap-2">
              <div>
                <small className="block text-xs text-muted">Host</small>
                <b className="text-sm">{activeDuel.hostName}</b>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  activeDuel.hostReady ? 'bg-green/18 text-green' : 'bg-panel2 text-muted'
                }`}
              >
                {activeDuel.hostReady ? 'Ready' : 'Waiting'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-line bg-bg flex items-center justify-between gap-2">
              <div>
                <small className="block text-xs text-muted">Challenger</small>
                <b className="text-sm">{activeDuel.guestName || 'Waiting to join…'}</b>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  activeDuel.guestReady ? 'bg-green/18 text-green' : 'bg-panel2 text-muted'
                }`}
              >
                {activeDuel.guestId ? (activeDuel.guestReady ? 'Ready' : 'Not ready') : 'Empty'}
              </span>
            </div>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleToggleReady()}
              className={`min-h-11 px-5 rounded-xl border font-bold text-sm cursor-pointer transition-all ${
                myRoomReady
                  ? 'border-line bg-panel2 text-ink'
                  : 'border-cyan bg-cyan text-cyan-ink hover:brightness-110'
              }`}
            >
              {myRoomReady ? 'Cancel Ready' : 'Ready Up'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void cancelOrForfeitDuel()}
              className="min-h-11 px-4 rounded-xl border border-line bg-transparent text-muted hover:text-ink text-sm font-semibold cursor-pointer"
            >
              Leave Room
            </button>
          </div>
        </section>
      ) : activeDuel.status === 'active' ? (
        <section className="bg-panel border border-line rounded-2xl p-6 grid gap-5 max-w-[760px]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {TRACK_LABELS[activeDuel.track]} ·{' '}
                {activeDuel.wagerMode === 'streak'
                  ? '🔥 Streak Breaker'
                  : activeDuel.wagerXp === 0
                    ? 'Friendly'
                    : `${activeDuel.wagerXp} XP Pot`}
              </span>
              {answerStreak >= 2 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber/18 border border-amber/40 text-amber text-xs font-bold">
                  🔥 {answerStreak}x Streak
                  {liveBonusMs > 0 ? ` · -${(liveBonusMs / 1000).toFixed(1)}s clock` : ''}
                </span>
              )}
            </div>
            <span className="num text-lg font-bold text-cyan">
              {countdownSec > 0 ? `Starting in ${countdownSec}…` : formatDuelTime(sprintElapsedMs)}
            </span>
          </div>

          {/* Live 8-Bit ("1 Byte") 2-player progress bars */}
          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3">
            <div className="p-3 rounded-xl border border-line bg-bg">
              <div className="flex justify-between text-xs font-bold">
                <span>You</span>
                <span className="num text-cyan">
                  {score}/{duelQuestions.length} right
                </span>
              </div>
              <BinaryByteBar total={duelQuestions.length} bits={bits} />
            </div>

            <div className="p-3 rounded-xl border border-line bg-bg">
              <div className="flex justify-between text-xs font-bold">
                <span>{opponentName}</span>
                <span className="num text-amber">
                  {opponentProgress?.score ?? 0}/{duelQuestions.length} right
                </span>
              </div>
              <BinaryByteBar
                total={duelQuestions.length}
                bits={opponentProgress?.bits ?? []}
              />
            </div>
          </div>

          {countdownSec > 0 ? (
            <div className="py-10 text-center grid gap-2">
              <div className="num text-5xl font-bold text-cyan">{countdownSec}</div>
              <p className="m-0 text-sm text-muted">
                Fingers ready — build an 8-bit Byte as fast as you can!
              </p>
            </div>
          ) : localDone ? (
            <div className="py-8 text-center grid gap-2">
              <h2 className="m-0 text-xl font-bold">
                {score === duelQuestions.length ? 'Full Byte (8/8)! ' : ''}Score locked: {score} /{' '}
                {duelQuestions.length} in {formatDuelTime(localElapsedMs)}
              </h2>
              {localBonusMs > 0 && (
                <p className="m-0 text-xs font-bold text-amber">
                  Includes -{(localBonusMs / 1000).toFixed(1)}s streak speed bonus!
                </p>
              )}
              <p className="m-0 text-sm text-muted">
                Waiting for {opponentName} to finish…
              </p>
            </div>
          ) : (
            duelQuestions[qIndex] && (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-2 text-xs text-muted font-semibold flex-wrap">
                  <span>
                    Bit {qIndex + 1} of {duelQuestions.length} · {duelQuestions[qIndex].topic}
                  </span>
                  {duelQuestions[qIndex].kind !== 'quiz' && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                        duelQuestions[qIndex].kind === 'generated'
                          ? 'bg-cyan/15 text-cyan'
                          : 'bg-amber/15 text-amber'
                      }`}
                    >
                      {duelQuestions[qIndex].kind === 'generated' ? 'Live Generated' : 'Troubleshoot'}
                    </span>
                  )}
                </div>
                <h2 className="m-0 text-xl font-bold leading-snug">
                  {duelQuestions[qIndex].prompt}
                </h2>
                <div className="grid gap-2.5 mt-1">
                  {duelQuestions[qIndex].choices.map((choice, idx) => {
                    const isPicked = pickedChoice === idx;
                    const isRight = idx === duelQuestions[qIndex].correctIndex;
                    let cls = 'border-line bg-bg text-ink hover:border-cyan';
                    if (pickedChoice !== null) {
                      if (isRight) {
                        cls = 'border-green bg-green/18 text-ink';
                      } else if (isPicked) {
                        cls = 'border-red bg-red/18 text-ink';
                      }
                    }
                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={pickedChoice !== null}
                        onClick={() => handlePickAnswer(idx)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl border text-[0.9375rem] font-semibold cursor-pointer transition-colors ${cls}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {!localDone && (
            <div className="pt-2 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => void cancelOrForfeitDuel()}
                className="min-h-9 px-3 rounded-lg border border-line bg-transparent text-xs font-semibold text-muted hover:text-ink cursor-pointer"
              >
                Forfeit Match
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-panel border border-line rounded-2xl p-6 grid gap-5 max-w-[680px]">
          {(() => {
            const won = activeDuel.winnerId === playerId;
            const draw = activeDuel.winnerId === null;
            const myScore = isHost ? (activeDuel.hostScore ?? 0) : (activeDuel.guestScore ?? 0);
            const heading = draw ? 'Exact Draw!' : won ? 'Victory!' : 'Defeat';
            const xpLine = isTestDuel
              ? 'Local Test Mode · No XP wagered or saved'
              : activeDuel.wagerMode === 'streak'
                ? draw
                  ? 'Tie match · Daily streaks kept safe'
                  : won
                    ? `+${STREAK_WAGER_REWARD_XP} XP & Win Streak Shield earned!`
                    : activeDuel.shieldConsumed
                      ? 'Streak Shield saved your Daily Streak!'
                      : 'Daily Streak broken! Restore it in the top bar (200 XP).'
                : activeDuel.wagerXp === 0
                  ? 'Friendly match · 0 XP wagered'
                  : draw
                    ? 'Tie match · 0 XP transferred'
                    : won
                      ? `+${activeDuel.wagerXp} XP wager won!`
                      : `-${activeDuel.wagerXp} XP wagered`;

            return (
              <>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="m-0 text-2xl font-bold">{heading}</h2>
                    <p
                      className={`mt-1 mb-0 text-sm font-bold ${
                        won ? 'text-green' : draw ? 'text-cyan' : 'text-amber'
                      }`}
                    >
                      {xpLine}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isTestDuel && (
                      <button
                        type="button"
                        onClick={() => startBotTestDuel(activeDuel.track)}
                        className="min-h-11 px-4 rounded-xl border border-line bg-bg text-ink font-bold text-sm cursor-pointer hover:border-muted"
                      >
                        New Test Duel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveDuel(null)}
                      className="min-h-11 px-5 rounded-xl border border-cyan bg-cyan text-cyan-ink font-bold text-sm cursor-pointer"
                    >
                      Back to Arena
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {won && activeDuel.bountyXp > 0 && (
                    <span className="px-3 py-1 rounded-full bg-amber/18 border border-amber/40 text-amber text-xs font-bold">
                      Streak Breaker Bounty: +{activeDuel.bountyXp} XP
                    </span>
                  )}
                  {((won && activeDuel.fullByteBonusXp > 0) ||
                    (duelQuestions.length > 0 && myScore === duelQuestions.length)) && (
                    <span className="px-3 py-1 rounded-full bg-green/18 border border-green/40 text-green text-xs font-bold">
                      Full Byte ({duelQuestions.length}/{duelQuestions.length}): +
                      {FULL_BYTE_BONUS_XP} XP
                    </span>
                  )}
                  {won && activeDuel.shieldAwarded && (
                    <span className="px-3 py-1 rounded-full bg-cyan/18 border border-cyan/40 text-cyan text-xs font-bold">
                      🛡️ Win Streak Shield Earned (+1)
                    </span>
                  )}
                  {!won && !draw && activeDuel.shieldConsumed && (
                    <span className="px-3 py-1 rounded-full bg-cyan/18 border border-cyan/40 text-cyan text-xs font-bold">
                      🛡️ Streak Shield Saved Your Win Streak!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3">
                  <div className="p-4 rounded-xl border border-line bg-bg">
                    <small className="block text-xs text-muted">
                      {activeDuel.hostName} {activeDuel.hostId === playerId ? '(you)' : ''}
                    </small>
                    <b className="num block text-xl mt-1">
                      {activeDuel.hostScore ?? 0} / {duelQuestions.length}
                    </b>
                    <span className="num text-xs text-muted">
                      Time: {formatDuelTime(activeDuel.hostTimeMs)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-line bg-bg">
                    <small className="block text-xs text-muted">
                      {activeDuel.guestName || 'Challenger'}{' '}
                      {activeDuel.guestId === playerId ? '(you)' : ''}
                    </small>
                    <b className="num block text-xl mt-1">
                      {activeDuel.guestScore ?? 0} / {duelQuestions.length}
                    </b>
                    <span className="num text-xs text-muted">
                      Time: {formatDuelTime(activeDuel.guestTimeMs)}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </section>
      )}
    </div>
  );
}
