"use client";

import { useEffect, useState } from "react";
import { useWarpTransition } from "./useWarpTransition";
import Seal from "./Seal";

// How long "คุณได้รับอัลบัม" shows alone before the album graphic + tap
// instruction fade in underneath it.
const REVEAL_DELAY_MS = 3000;

// Screen between AlbumIntro and the actual photo album: announces the
// album, then (after a beat) shows an album graphic to tap. Uses the same
// warp-speed transition as the album's own page-to-page flips (per user
// request — "like the year transitioning") rather than the walk-closer
// effect used on the landing page / AlbumIntro screens, for consistency
// with what's about to open.
export default function AlbumReveal({ onContinue }: { onContinue: () => void }) {
  const { starsLayer, flashLayer, contentRef, warp, warping } = useWarpTransition();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  function handleClick() {
    if (!revealed || warping) return;
    warp(onContinue);
  }

  return (
    <div
      onClick={handleClick}
      className={`relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6 ${
        revealed ? "cursor-pointer" : ""
      }`}
    >
      {starsLayer}
      {flashLayer}

      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-8">
        <p className="max-w-sm animate-rise-in text-center font-display text-2xl text-wine-deep">
          คุณได้รับอัลบัม
        </p>

        {revealed && (
          <div className="flex animate-soft-reveal flex-col items-center gap-4">
            {/* Album graphic — CSS/SVG cover (no source image), same visual
                language as the reward reveal's present box: wine + gold
                border, with the existing infinity-knot seal as its cover
                emblem. */}
            <div className="flex h-40 w-32 flex-col items-center justify-center rounded-md border-2 border-gold bg-wine shadow-lg">
              <Seal />
            </div>
            <p className="animate-pulse-soft font-body text-sm tracking-wide text-ink-soft">
              กดเพื่อเปิดอัลบัม
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
