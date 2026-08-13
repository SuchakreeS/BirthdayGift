"use client";

import { useEffect, useRef, useState } from "react";
import type { PageFlip } from "page-flip";

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
  const bookRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  // Bumped per-page on every flip-to so the sentence spans remount and
  // replay their fade-in each time she turns to that page — same pattern
  // as the photo album's fly-in-pin retrigger.
  const [animKeys, setAnimKeys] = useState<number[]>(() => PAGES.map(() => 0));

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { PageFlip } = await import("page-flip");
      if (cancelled || !bookRef.current) return;

      const pageFlip = new PageFlip(bookRef.current, {
        width: 300,
        height: 380,
        size: "stretch",
        minWidth: 240,
        maxWidth: 460,
        minHeight: 320,
        maxHeight: 560,
        showCover: false,
        usePortrait: true,
        maxShadowOpacity: 0.4,
        mobileScrollSupport: false,
      });

      const pages = bookRef.current.querySelectorAll<HTMLElement>(".photo-page");
      pageFlip.loadFromHTML(pages);
      pageFlip.on("flip", (e) => {
        const index = e.data as number;
        setAnimKeys((prev) => {
          const next = [...prev];
          next[index] = (next[index] ?? 0) + 1;
          return next;
        });
      });

      pageFlipRef.current = pageFlip;
    })();

    return () => {
      cancelled = true;
      pageFlipRef.current?.destroy();
      pageFlipRef.current = null;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10 animate-rise-in">
      <p className="font-body text-xs uppercase tracking-widest text-ink-soft">
        placeholder text — real message swaps in later
      </p>

      {/* Capped width so the book never grows past StPageFlip's
          minWidth*2 portrait/landscape threshold — otherwise on wide
          desktop viewports it silently switches to a two-page side-by-side
          "spread" instead of turning one page at a time. Same fix as
          PhotoAlbum.tsx. */}
      <div className="w-full max-w-110">
        <div ref={bookRef}>
          {PAGES.map((sentences, i) => (
            <div key={i} className="photo-page">
              <div className="flex h-full w-full flex-col justify-center gap-3 bg-ivory px-6">
                {sentences.map((line, j) => (
                  <p
                    key={`${animKeys[i]}-${j}`}
                    className="animate-soft-reveal font-display text-base leading-snug text-wine-deep"
                    style={{ animationDelay: `${j * SENTENCE_DELAY_MS}ms` }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="font-body text-sm text-ink-soft">
        Swipe or tap the page edge to turn
      </p>
    </div>
  );
}
