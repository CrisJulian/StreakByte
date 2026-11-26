import { useEffect, useState } from 'react';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function Toast() {
  const toastMessage = useStreakByteStore((s) => s.toastMessage);
  const toastTick = useStreakByteStore((s) => s.toastTick);
  const clearToast = useStreakByteStore((s) => s.clearToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toastMessage) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, 2600);
    const clearTimer = window.setTimeout(() => {
      clearToast();
    }, 2850);
    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [toastMessage, toastTick, clearToast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed left-1/2 z-[60] -translate-x-1/2 px-4 py-2.5 border border-cyan bg-[var(--dark-card)] text-white font-mono font-bold text-[11px] uppercase tracking-[0.06em] pointer-events-none transition-all duration-200 max-[760px]:bottom-[calc(76px+env(safe-area-inset-bottom,0px))] bottom-[calc(24px+env(safe-area-inset-bottom,0px))] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
    >
      {toastMessage ?? ''}
    </div>
  );
}
