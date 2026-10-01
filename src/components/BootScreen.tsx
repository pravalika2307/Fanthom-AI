import React, { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'fading-out'>('loading');

  useEffect(() => {
    // Animate progress bar from 0 → 100 over ~800ms
    const start = performance.now();
    const duration = 800;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(elapsed / duration, 1);
      // Ease-out curve for a natural feel
      const eased = 1 - Math.pow(1 - pct, 3);
      setProgress(Math.round(eased * 100));

      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        // Brief pause at 100%, then fade out
        setTimeout(() => {
          setPhase('fading-out');
          // After CSS transition completes, unmount
          setTimeout(onComplete, 400);
        }, 120);
      }
    };

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <div
      className={`boot-screen ${phase === 'fading-out' ? 'boot-screen--hidden' : ''}`}
      aria-label="Fanthom loading"
      role="status"
    >
      <div className="boot-screen__inner">
        <p className="boot-screen__wordmark">FANTHOM</p>
        <p className="boot-screen__tagline">Meeting intelligence workspace</p>

        <div className="boot-screen__progress-track" aria-hidden="true">
          <div
            className="boot-screen__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="boot-screen__status">Loading workspace…</p>
      </div>
    </div>
  );
};
