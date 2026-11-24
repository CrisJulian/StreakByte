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
      className={`fixed left-1/2 z-[60] -translate-x-1/2 px-[18px] py-3 rounded-xl bg-ink text-bg font-semibold text-sm pointer-events-none transition-all duration-200 max-[760px]:bottom-[calc(84px+env(safe-area-inset-bottom,0px))] bottom-[calc(28px+env(safe-area-inset-bottom,0px))] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      {toastMessage ?? ''}
    </div>
  );
}
