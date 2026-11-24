import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { useStreakByteStore } from './store/useStreakByteStore';
import './index.css';

// "prompt" mode: never swap the app mid-lesson. Tell the learner and let them choose.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    useStreakByteStore.getState().showToast('New version ready. Reload when you finish this lesson.');
    window.__streakbyteUpdate = () => updateSW(true);
  },
  onOfflineReady() {
    useStreakByteStore.getState().showToast('StreakByte is ready to use offline.');
  },
});

declare global {
  interface Window {
    __streakbyteUpdate?: () => Promise<void>;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
