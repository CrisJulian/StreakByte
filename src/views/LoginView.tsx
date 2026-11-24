import { useState, type SyntheticEvent } from 'react';
import { services } from '../composition';
import { useStreakByteStore } from '../store/useStreakByteStore';

type Mode = 'login' | 'signup';

const inputClass =
  'w-full min-h-11 px-3.5 rounded-[10px] border border-line bg-bg text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-cyan';

export function LoginView() {
  const navigate = useStreakByteStore((s) => s.navigate);
  const showToast = useStreakByteStore((s) => s.showToast);

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user =
        mode === 'login'
          ? await services.auth.signIn(email, password, keepLoggedIn)
          : await services.auth.signUp(email, password);
      showToast(`Welcome, ${user.displayName}!`);
      navigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setError(null);
    try {
      await services.auth.sendPasswordReset(email);
      showToast('If that account exists, a reset link is on its way.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enter your email first.');
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] max-[860px]:grid-cols-1 gap-6 items-stretch min-h-[70vh]">
      <section
        aria-label="StreakByte"
        className="flex flex-col items-center justify-center gap-5 p-6 rounded-2xl border border-line bg-panel"
      >
        <img src="/buddy-logo.png" alt="StreakByte" className="h-10 w-auto" />
        <img
          src="/mascot.png"
          alt="BYTE, the StreakByte robot mascot"
          className="w-44 h-44 object-contain rounded-2xl border border-line bg-panel2"
        />
        <p className="max-w-[260px] text-center px-4 py-3 rounded-2xl border border-line bg-bg text-[0.9375rem]">
          Beep boop! Insert credits or log in to resume the session.
        </p>
      </section>

      <section
        aria-labelledby="login-heading"
        className="flex flex-col justify-center gap-4 p-6 rounded-2xl border border-line bg-panel"
      >
        <div>
          <h1 id="login-heading" className="text-2xl font-extrabold">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted mt-1">
            {mode === 'login'
              ? 'Log in to pick up your streak where you left off.'
              : 'Use your school email to start your first streak.'}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Account"
          className="inline-flex p-1 border border-line rounded-xl bg-bg gap-1 self-start"
        >
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`min-h-10 px-4 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                mode === m ? 'bg-cyan text-cyan-ink' : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              {m === 'login' ? 'Log in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="grid gap-4" noValidate>
          <label className="grid gap-1.5 text-sm font-semibold">
            Email or username
            <input
              type="text"
              autoComplete="username"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm font-semibold">
                Password
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={forgot}
                  className="text-sm text-cyan underline underline-offset-2 bg-transparent border-0 cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-20`}
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-9 px-3 rounded-lg border-0 bg-transparent text-muted text-sm font-semibold cursor-pointer hover:text-ink"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <label className="inline-flex items-center gap-2.5 text-[0.9375rem] cursor-pointer">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-5 h-5 accent-cyan"
              />
              Keep me logged in on this device
            </label>
          )}

          <p role="alert" aria-live="polite" className="min-h-5 text-sm text-amber">
            {error}
          </p>

          <button
            type="submit"
            disabled={busy}
            className="min-h-12 rounded-[10px] border-0 bg-cyan text-cyan-ink font-bold text-base cursor-pointer disabled:opacity-60"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-muted">
          {mode === 'login' ? 'New to StreakByte? ' : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-cyan underline underline-offset-2 bg-transparent border-0 cursor-pointer text-sm"
          >
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </section>
    </div>
  );
}
