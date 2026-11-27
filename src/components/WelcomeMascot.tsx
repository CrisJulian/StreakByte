import { useEffect, useRef, useState } from 'react';

const CANVAS_SIZE = 224;

interface Buffers {
  visited: Uint8Array;
  queue: Int32Array;
}

/**
 * Flood-fills exterior near-white background pixels starting from all four edges
 * so the mascot floats transparently over both dark and light themes while keeping
 * its white face, ears, and chest 100% opaque inside the dark outline.
 */
export function removeExteriorWhiteBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  reusable?: Buffers,
): void {
  const total = width * height;
  const visited =
    reusable && reusable.visited.length === total ? reusable.visited : new Uint8Array(total);
  const queue =
    reusable && reusable.queue.length === total ? reusable.queue : new Int32Array(total);
  visited.fill(0);

  let head = 0;
  let tail = 0;

  const isExteriorWhite = (o: number): boolean => {
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const max = r > g ? (r > b ? r : b) : g > b ? g : b;
    const min = r < g ? (r < b ? r : b) : g < b ? g : b;
    return min >= 216 && max - min <= 34;
  };

  const tryEnqueue = (x: number, y: number) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    const o = idx * 4;
    if (isExteriorWhite(o)) {
      visited[idx] = 1;
      queue[tail++] = idx;
    }
  };

  for (let x = 0; x < width; x++) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  while (head < tail) {
    const cur = queue[head++];
    const cx = cur % width;
    const cy = (cur - cx) / width;
    if (cx > 0) tryEnqueue(cx - 1, cy);
    if (cx < width - 1) tryEnqueue(cx + 1, cy);
    if (cy > 0) tryEnqueue(cx, cy - 1);
    if (cy < height - 1) tryEnqueue(cx, cy + 1);
  }

  for (let idx = 0; idx < total; idx++) {
    if (visited[idx]) {
      data[idx * 4 + 3] = 0;
    }
  }

  // Soft anti-alias and de-fringe 1px border touching transparent exterior pixels
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;

      const touchesExterior =
        visited[idx - 1] === 1 ||
        visited[idx + 1] === 1 ||
        visited[idx - width] === 1 ||
        visited[idx + width] === 1 ||
        visited[idx - width - 1] === 1 ||
        visited[idx - width + 1] === 1 ||
        visited[idx + width - 1] === 1 ||
        visited[idx + width + 1] === 1;

      if (!touchesExterior) continue;

      const o = idx * 4;
      const r = data[o];
      const g = data[o + 1];
      const b = data[o + 2];
      const max = r > g ? (r > b ? r : b) : g > b ? g : b;
      const min = r < g ? (r < b ? r : b) : g < b ? g : b;
      const lum = (r + g + b) / 3;

      if (lum > 145 && max - min <= 48) {
        const alpha = Math.max(0, Math.min(255, Math.round((235 - lum) * 2.8)));
        data[o + 3] = alpha;
        // Pull light compression halo toward the navy outline so dark mode has no white fringe
        data[o] = Math.min(r, 24);
        data[o + 1] = Math.min(g, 48);
        data[o + 2] = Math.min(b, 86);
      }
    }
  }
}

export function WelcomeMascot() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasFrame, setHasFrame] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const buffers: Buffers = {
      visited: new Uint8Array(CANVAS_SIZE * CANVAS_SIZE),
      queue: new Int32Array(CANVAS_SIZE * CANVAS_SIZE),
    };

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    let cancelled = false;
    let rafId: number | null = null;
    let lastTime = -1;

    const drawFrame = () => {
      if (cancelled || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return false;
      }

      // Fill pure white first with a small inset so edge flood-fill always wraps around the mascot
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const inset = 4;
      const box = CANVAS_SIZE - inset * 2;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      // Crop a bit of the empty vertical margin while keeping the full waving robot centered
      const cropY = vh * 0.08;
      const cropH = vh * 0.84;
      const scale = Math.min(box / vw, box / cropH);
      const dw = vw * scale;
      const dh = cropH * scale;
      const dx = (CANVAS_SIZE - dw) / 2;
      const dy = (CANVAS_SIZE - dh) / 2;

      ctx.drawImage(video, 0, cropY, vw, cropH, dx, dy, dw, dh);

      const frame = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      removeExteriorWhiteBackground(frame.data, CANVAS_SIZE, CANVAS_SIZE, buffers);
      ctx.putImageData(frame, 0, 0);
      setHasFrame(true);
      return true;
    };

    const tick = () => {
      if (cancelled) return;
      if (video.readyState >= 2 && video.currentTime !== lastTime) {
        if (drawFrame()) {
          lastTime = video.currentTime;
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const startPlayback = () => {
      if (cancelled) return;
      drawFrame();
      const playPromise = video.play?.();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    video.addEventListener('loadeddata', startPlayback);
    video.addEventListener('canplay', startPlayback);
    if (video.readyState >= 2) {
      startPlayback();
    }

    return () => {
      cancelled = true;
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('canplay', startPlayback);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      role="img"
      aria-label="Your study buddy waving welcome"
      className="relative w-[88px] h-[88px] max-[760px]:w-[64px] max-[760px]:h-[64px] flex-none flex items-center justify-center"
    >
      <video
        ref={videoRef}
        src="/welcome-pose.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-[0.001] pointer-events-none"
      />
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        aria-hidden="true"
        className={`relative w-full h-full object-contain ${hasFrame ? 'block' : 'hidden'}`}
      />
      {!hasFrame && (
        <span className="buddy-logo w-[88%] h-[88%] block" aria-hidden="true" />
      )}
    </div>
  );
}
