import { useEffect, useState, type SyntheticEvent } from 'react';
import { CornerBrackets } from '../components/ByteMascotSvg';
import { services } from '../composition';
import { useStreakByteStore } from '../store/useStreakByteStore';

const inputClass =
  'w-full min-h-10 px-3 border border-line bg-bg text-ink placeholder:text-muted focus-visible:outline-none focus-visible:border-ink text-xs font-mono';

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error_description') || params.get('error');
    if (oauthError) {
      setError(oauthError);
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
    }
  }, []);

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

  const handleGoogle = async () => {
    setError(null);
    setBusy(true);
    try {
      await services.auth.signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Try again.');
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
    <div className="w-full max-w-[920px] bg-panel border border-line grid grid-cols-[1fr_1.08fr] max-[820px]:grid-cols-1">
      <div className="relative bg-[var(--dark-card)] text-white p-8 flex flex-col justify-between gap-6 border-r border-line max-[820px]:border-r-0 max-[820px]:border-b">
        <CornerBrackets light />
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-cyan">
          <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
          <span>STREAKBYTE // TRAINING TERMINAL</span>
        </div>
        <div className="grid place-items-center py-4">
          <img
            src="/buddy-logo.png"
            alt="BYTE, the StreakByte mascot"
            className="w-40 h-40 object-contain"
          />
        </div>
        <div>
          <div className="font-disp text-[30px] leading-[1.04] uppercase tracking-[-0.02em] mb-2">
            BUILD HARDWARE.
            <br />
            MASTER NETWORKS.
          </div>
          <p className="m-0 text-xs text-white/70">
            Daily 5-minute missions, hands-on PC &amp; LAN labs, and live class leagues.
          </p>
        </div>
      </div>

      <section aria-labelledby="login-heading" className="p-8 max-[560px]:p-5 flex flex-col justify-center gap-4">
        <div
          role="tablist"
          aria-label="Account mode"
          className="inline-flex self-start border border-ink bg-panel"
        >
          {(['login', 'signup'] as const).map((m, idx) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`min-h-9 px-4 border-0 font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${idx > 0 ? 'border-l border-ink' : ''
                } ${mode === m
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-panel text-ink hover:bg-panel2'
                }`}
            >
              {m === 'login' ? 'Log in' : 'Create account'}
            </button>
          ))}
        </div>

        <div>
          <h1 id="login-heading" className="m-0 sb-page-title text-[26px]">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted mt-1 mb-0 text-xs">
            {mode === 'login'
              ? 'Log in to pick up your streak where you left off.'
              : 'Use your school email to start your first streak.'}
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-3 w-full" noValidate>
          <label className="grid gap-1.5 text-[10px] font-bold uppercase tracking-[0.07em] text-muted">
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
            <label
              htmlFor="login-password"
              className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-16`}
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-h-8 px-2.5 border-0 bg-transparent text-muted text-[10px] font-bold uppercase cursor-pointer hover:text-ink"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={forgot}
                  className="text-[11px] text-cyan hover:underline bg-transparent border-0 cursor-pointer font-bold"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {mode === 'login' && (
            <label className="inline-flex items-center gap-2 text-xs text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 accent-cyan cursor-pointer"
              />
              Keep me logged in on this device
            </label>
          )}

          {error && (
            <p role="alert" aria-live="polite" className="text-xs text-amber font-bold my-0">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="sb-cut w-full min-h-10 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:brightness-110 disabled:opacity-60 transition-colors"
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>

          <div className="relative flex items-center justify-center my-0.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <span className="relative px-3 bg-panel text-[10px] text-muted font-bold uppercase tracking-wider">
              or
            </span>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleGoogle}
            className="w-full min-h-10 border border-line bg-panel text-ink font-bold text-[11px] uppercase tracking-[0.05em] cursor-pointer transition-colors hover:border-ink hover:bg-panel2 disabled:opacity-60 flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.3 0 6.08-1.09 8.105-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.225 1.18-3.24 0-5.98-2.19-6.96-5.13H1.03v3.14C3.05 21.19 7.21 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.04 14.04c-.25-.74-.39-1.53-.39-2.34s.14-1.6.39-2.34V6.22H1.03C.37 7.53 0 9.01 0 11.7s.37 4.17 1.03 5.48l4.01-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.075 1.19 15.295 0 12 0 7.21 0 3.05 2.81 1.03 6.82l4.01 3.14c.98-2.94 3.72-5.21 6.96-5.21Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => loginAsGuest()}
            className="sb-cut w-full min-h-10 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
          >
            <span>Continue as Guest</span>
            <span className="text-[9.5px] px-1.5 py-0.5 bg-cyan text-cyan-ink font-bold">
              Dev Mode
            </span>
          </button>
        </form>
      </section>
    </div>
  );
}
