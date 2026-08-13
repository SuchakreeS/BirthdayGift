"use client";

import { useEffect, useMemo } from "react";

const STAR_COUNT = 22;
// How long the text/stars show before auto-advancing into the letter pages.
const AUTO_ADVANCE_MS = 4000;

type FallingStar = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  glyph: string;
};

// Brief interstitial between the wish-input end screen and the letter
// pages — reassures her the site isn't done yet while the song keeps
// playing in the background. Same falling-star pattern as RewardReveal.
export default function SongContinues({ onContinue }: { onContinue: () => void }) {
  const fallingStars = useMemo<FallingStar[]>(
    () =>
      Array.from({ length: STAR_COUNT }, () => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 10,
        duration: 6 + Math.random() * 6,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 60,
        glyph: Math.random() > 0.5 ? "✦" : "✧",
      })),
    [],
  );

  useEffect(() => {
    const timer = setTimeout(onContinue, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 animate-rise-in">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {fallingStars.map((star, i) => (
          <span
            key={i}
            className="animate-star-fall absolute top-0 text-gold/70"
            style={{
              left: `${star.left}%`,
              fontSize: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ["--drift" as any]: `${star.drift}px`,
            }}
          >
            {star.glyph}
          </span>
        ))}
      </div>

      <p className="relative z-10 max-w-sm text-center font-display text-2xl text-wine-deep">
        เพลงยังไม่จบเลย เพราะงั้นอ่านต่ออีกนิดนึงนะ
      </p>
    </div>
  );
}
