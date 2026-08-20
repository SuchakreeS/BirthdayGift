"use client";

import { useState } from "react";

// Brief screen right after the quiz is passed, before the photo album.
// Reuses LandingScreen's "walking closer" transition (same animate-walk-closer
// keyframe/timing) so the two tap-to-advance moments feel like the same
// interaction language, but this one is a deliberate button tap rather than
// a tap-anywhere, since there's a specific instruction to press.
export default function AlbumIntro({ onContinue }: { onContinue: () => void }) {
  const [transitioning, setTransitioning] = useState(false);

  function handleClick() {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(onContinue, 2200);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div
        className={`flex flex-col items-center gap-6 text-center ${
          transitioning ? "animate-walk-closer" : "animate-rise-in"
        }`}
      >
        <p className="max-w-sm font-display text-2xl text-wine-deep">
          ใช่จริงๆด้วย อ้วนมาเร็ววว เรามีอะไรให้ดู
        </p>
        <button
          type="button"
          onClick={handleClick}
          className="rounded-md border border-gold px-6 py-3 font-body text-sm text-wine-deep transition-colors hover:bg-blush"
        >
          กดเพื่อเดินเข้าไป
        </button>
      </div>
    </div>
  );
}
