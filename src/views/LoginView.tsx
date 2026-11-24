import { useState, type SyntheticEvent } from 'react';
import { services } from '../composition';
import { useStreakByteStore } from '../store/useStreakByteStore';

const inputClass =
  'w-full min-h-10 px-3.5 rounded-[10px] border border-line bg-bg text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-cyan text-sm';

export function LoginView() {
  const navigate = useStreakByteStore((s) => s.navigate);
  const showToast = useStreakByteStore((s) => s.showToast);
  const setAuthUser = useStreakByteStore((s) => s.setAuthUser);
  const loginAsGuest = useStreakByteStore((s) => s.loginAsGuest);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
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
      setAuthUser(user);
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
    <div className="flex justify-center items-center w-full py-4">
      {/* Single centered panel */}
      <section
        aria-labelledby="login-heading"
        className="relative flex flex-col items-center gap-3 p-7 rounded-2xl border border-line bg-panel shadow-sm w-full max-w-[460px]"
      >

        {/* Mascot */}
        <img
          src="/buddy-logo.png"
          alt="BYTE, the StreakByte mascot"
          className="w-40 h-40 object-contain mt-2 drop-shadow-lg"
        />

        {/* Title */}
        <div className="text-center">
          <h1 id="login-heading" className="text-2xl font-extrabold text-ink tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted mt-1 text-sm">
            {mode === 'login'
              ? 'Log in to pick up your streak where you left off.'
              : 'Use your school email to start your first streak.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          role="tablist"
          aria-label="Account mode"
          className="inline-flex p-1 border border-line rounded-xl bg-bg gap-1"
        >
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError(null); }}
              className={`min-h-9 px-5 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${mode === m ? 'bg-cyan text-cyan-ink font-bold' : 'bg-transparent text-muted hover:text-ink'
                }`}
            >
              {m === 'login' ? 'Log in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="grid gap-3 w-full" noValidate>
          <label className="grid gap-1.5 text-sm font-semibold text-ink">
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

          <div className="grid gap-1">
            <label htmlFor="login-password" className="text-sm font-semibold text-ink">
              Password
            </label>
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
            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={forgot}
                  className="text-xs text-cyan hover:underline bg-transparent border-0 cursor-pointer font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {mode === 'login' && (
            <label className="inline-flex items-center gap-2.5 text-[0.9375rem] text-ink/90 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-5 h-5 accent-cyan rounded cursor-pointer"
              />
              Keep me logged in on this device
            </label>
          )}

          {error && (
            <p role="alert" aria-live="polite" className="text-sm text-amber font-medium my-0">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full min-h-10 rounded-[10px] border-0 bg-cyan text-cyan-ink font-bold text-sm cursor-pointer hover:brightness-110 disabled:opacity-60 transition-all shadow-sm"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          <div className="relative flex items-center justify-center my-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative px-3 bg-panel text-xs text-muted font-semibold uppercase tracking-wider">
              or
            </span>
          </div>

          <button
            type="button"
            onClick={() => loginAsGuest()}
            className="w-full min-h-9 rounded-[10px] border border-line bg-panel2 text-ink font-semibold text-sm cursor-pointer transition-colors hover:border-cyan hover:text-cyan flex items-center justify-center gap-2"
          >
            <span>Continue as Guest</span>
            <span className="text-[0.6875rem] px-2 py-0.5 rounded-full bg-cyan/15 text-cyan font-bold tracking-wide">
              Dev Mode
            </span>
          </button>
        </form>
      </section>
    </div>
  );
}
