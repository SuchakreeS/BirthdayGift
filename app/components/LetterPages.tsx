"use client";

import { useState } from "react";
import { useWarpTransition } from "./useWarpTransition";

// PLACEHOLDER CONTENT — 2-3 pages, 4-5 sentences each. Swap this array for
// the real message whenever it's ready; nothing else needs to change.
const PAGES: string[][] = [
  [
    "[This is where your birthday message to her begins.]",
    "[Add a line about a memory you share together.]",
    "[Say something you love about her.]",
    "[Keep it short — 4-5 lines reads well per page.]",
    "[This placeholder text swaps out for your real message later.]",
  ],
  [
    "[Page 2, line 1 — placeholder.]",
    "[Page 2, line 2 — placeholder.]",
    "[Page 2, line 3 — placeholder.]",
    "[Page 2, line 4 — placeholder.]",
    "[Page 2, line 5 — placeholder.]",
  ],
  [
    "[Page 3, line 1 — placeholder.]",
    "[Page 3, line 2 — placeholder.]",
    "[Page 3, line 3 — placeholder.]",
    "[Page 3, line 4 — placeholder.]",
    "[Page 3, line 5 — placeholder.]",
  ],
];

// How long each sentence waits after the previous one before fading in.
const SENTENCE_DELAY_MS = 700;

export default function LetterPages() {
  const { starsLayer, flashLayer, contentRef, warp, warping } = useWarpTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Bumped per-page on every navigate-to so the sentence spans remount and
  // replay their fade-in each time she turns to that page — same pattern as
  // the photo album's fly-in-pin retrigger.
  const [animKeys, setAnimKeys] = useState<number[]>(() => PAGES.map(() => 0));

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= PAGES.length || warping) return;
    warp(() => {
      setCurrentIndex(nextIndex);
      setAnimKeys((prev) => {
        const next = [...prev];
        next[nextIndex] = (next[nextIndex] ?? 0) + 1;
        return next;
      });
    });
  }

  const sentences = PAGES[currentIndex];
  const isLastPage = currentIndex >= PAGES.length - 1;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10 animate-rise-in">
      {starsLayer}
      {flashLayer}

      {/* Fixed page-card aspect ratio (matches the photo album's card), so
          this still reads as "a page" without StPageFlip's book mechanics. */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-110 overflow-hidden rounded-md bg-ivory shadow-lg aspect-300/380"
      >
        <div className="flex h-full w-full flex-col justify-center gap-3 px-6">
          {sentences.map((line, j) => (
            <p
              key={`${animKeys[currentIndex]}-${j}`}
              className="animate-soft-reveal font-display text-base leading-snug text-wine-deep"
              style={{ animationDelay: `${j * SENTENCE_DELAY_MS}ms` }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center gap-8">
        <button
          type="button"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0 || warping}
          className="font-body text-sm text-gold underline underline-offset-4 disabled:opacity-30"
        >
          ← Back
        </button>
        {!isLastPage && (
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            disabled={warping}
            className="font-body text-sm text-gold underline underline-offset-4 disabled:opacity-30"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
