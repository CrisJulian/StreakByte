import { useState } from 'react';
import { Icon } from '../components/Icon';
import { TRACKS } from '../data/curriculum';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { TrackId } from '../types/streakbyte';

type CurriculumChoice = 'hw' | 'net' | 'both';

const CHOICES: {
  id: CurriculumChoice;
  title: string;
  subtitle: string;
  tracks: TrackId[];
  recommended?: boolean;
}[] = [
    {
      id: 'hw',
      title: TRACKS.hw.heading,
      subtitle: `${TRACKS.hw.lessons.length} lessons · CPU, RAM, storage, PSU, and PC Build Lab`,
      tracks: ['hw'],
    },
    {
      id: 'net',
      title: TRACKS.net.heading,
      subtitle: `${TRACKS.net.lessons.length} lessons · IPv4, subnets, routers, and Network Lab`,
      tracks: ['net'],
    },
    {
      id: 'both',
      title: 'Both tracks',
      subtitle: `${TRACKS.hw.lessons.length + TRACKS.net.lessons.length} lessons · Full Hardware & Networking curriculum`,
      tracks: ['hw', 'net'],
      recommended: true,
    },
  ];

export function OnboardingView() {
  const completeOnboarding = useStreakByteStore((s) => s.completeOnboarding);
  const authUser = useStreakByteStore((s) => s.authUser);
  const [choice, setChoice] = useState<CurriculumChoice>('both');
  const [saving, setSaving] = useState(false);

  const firstName = (authUser?.displayName || 'Learner').trim().split(/\s+/)[0] || 'Learner';
  const picked = CHOICES.find((c) => c.id === choice) ?? CHOICES[2];

  const handleStart = async () => {
    setSaving(true);
    try {
      await completeOnboarding(picked.tracks);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="onboarding-heading"
      className="sb-enter flex flex-col gap-5 p-7 max-[560px]:p-5 border border-line bg-panel w-full max-w-[600px]"
    >
      <div>
        <p className="m-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-cyan">
          <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
          Welcome, {firstName}
        </p>
        <h1
          id="onboarding-heading"
          className="m-0 mt-1.5 sb-page-title text-[28px] text-ink"
        >
          Choose what you want to study
        </h1>
        <p className="m-0 mt-1.5 text-xs text-muted">
          Pick one track to stay focused, or study both. You can switch anytime in Profile settings.
        </p>
      </div>

      <div role="radiogroup" aria-labelledby="onboarding-heading" className="grid gap-2.5">
        {CHOICES.map((opt) => {
          const selected = choice === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setChoice(opt.id)}
              className={`flex items-start justify-between gap-3 p-4 border text-left cursor-pointer transition-colors ${selected
                  ? 'border-cyan bg-you'
                  : 'border-line bg-panel hover:border-ink hover:bg-panel2'
                }`}
            >
              <span className="grid gap-1">
                <span className="inline-flex items-center gap-2 font-head font-bold text-base text-ink">
                  {opt.title}
                  {opt.recommended && (
                    <span className="text-[9.5px] px-2 py-0.5 bg-cyan text-cyan-ink font-mono font-bold uppercase tracking-[0.06em]">
                      Recommended
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted">{opt.subtitle}</span>
              </span>
              <span
                aria-hidden="true"
                className={`grid place-items-center w-6 h-6 border flex-none mt-0.5 ${selected ? 'border-cyan bg-cyan text-cyan-ink' : 'border-line bg-panel2'
                  }`}
              >
                {selected && <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={handleStart}
        className="sb-cut w-full min-h-11 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00] disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving…' : 'Start learning'}
      </button>
    </section>
  );
}
