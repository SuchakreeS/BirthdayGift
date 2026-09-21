"use client";

import { useState } from "react";
import { useWarpTransition } from "./useWarpTransition";

// The real birthday message (3 pages), written by the user. Edit lines
// directly here if the wording ever needs to change — nothing else does.
const PAGES: string[][] = [
  [
    "ปีนี้อ้วนก็26แล้วเนอะ น้องแอ๊นโตแล้วววว",
    "ก็อยากจะขอให้อ้วนมีสุขภาพที่แข็งแรง",
    "มีความสุขเยอะๆ",
    "ได้ใช้ชีวิตแบบที่ชอบ",
    "แล้วก็ขอให้น่ารักแบบนี้ไปเรื่อยๆเลยยย",
  ],
  [
    "และสุดท้ายนี้ เราอยากจะบอกอ้วนว่า"
  ],
  [
    "Happy Birthday นะครับที่รักของเรา",
    "เรารักอ้วนนะ"
  ],
];

// Once the per-sentence cycle finishes, the full page's text fades in
// together (stacked, static) so she can re-read the whole thing at once —
// each line staggered by this much.
const FULL_TEXT_STAGGER_MS = 150;

export default function LetterPages() {
  const { starsLayer, flashLayer, contentRef, warp, warping } = useWarpTransition();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Which sentence of the current page is showing right now — only one
  // renders at a time, popping up then vanishing before the next appears.
  const [sentenceIndex, setSentenceIndex] = useState(0);
  // Once every sentence has cycled through once, switch to showing the
  // whole page's text together instead of one line at a time.
  const [showFullText, setShowFullText] = useState(false);
  // Bumped per-page on every navigate-to so the key changes even when
  // sentenceIndex resets to the same 0 — forces the first sentence to
  // remount and replay its pop-in each time she turns to that page.
  const [cycleKeys, setCycleKeys] = useState<number[]>(() => PAGES.map(() => 0));

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= PAGES.length || warping) return;
    warp(() => {
      setCurrentIndex(nextIndex);
      setSentenceIndex(0);
      setShowFullText(false);
      setCycleKeys((prev) => {
        const next = [...prev];
        next[nextIndex] = (next[nextIndex] ?? 0) + 1;
        return next;
      });
    });
  }

  const sentences = PAGES[currentIndex];
  const isLastPage = currentIndex >= PAGES.length - 1;

  // Once the current sentence has fully popped up and vanished, advance to
  // the next one on this page (the CSS animation itself handles the
  // pop-in → hold → vanish timing; this just chains them together) — or,
  // once the last one has played, reveal the full text instead.
  function handleSentenceDone() {
    if (sentenceIndex < sentences.length - 1) {
      setSentenceIndex(sentenceIndex + 1);
    } else {
      setShowFullText(true);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 py-10 animate-rise-in">
      {starsLayer}
      {flashLayer}

      {/* Fixed page-card aspect ratio (matches the photo album's card), so
          this still reads as "a page" without StPageFlip's book mechanics.
          Only one sentence lives inside at a time, centered — until the
          cycle finishes, when the full text fades in together instead. */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto w-full max-w-110 overflow-hidden rounded-md bg-ivory shadow-lg aspect-300/380"
      >
        {showFullText ? (
          <div className="flex h-full w-full flex-col justify-center gap-3 px-6">
            {sentences.map((line, j) => (
              <p
                key={j}
                className="animate-soft-reveal font-display text-base leading-snug text-wine-deep"
                style={{ animationDelay: `${j * FULL_TEXT_STAGGER_MS}ms` }}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-8">
            <p
              key={`${currentIndex}-${cycleKeys[currentIndex]}-${sentenceIndex}`}
              className="animate-letter-cycle text-center font-display text-2xl font-bold leading-snug text-wine-deep"
              onAnimationEnd={handleSentenceDone}
            >
              {sentences[sentenceIndex]}
            </p>
          </div>
        )}
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
