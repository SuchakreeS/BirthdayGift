"use client";

import { useMemo, useRef, useState } from "react";
import { createTimeline, stagger, utils } from "animejs";

// Shared warp-speed page transition — the same hyperspace star-streak +
// flash effect built for WishInput's screen transition, reused here to
// replace StPageFlip's page-turn book in the photo album and letter pages
// (both had page-flip bugs — collage overlap aside, the flip mechanics
// themselves were reported as unreliable/buggy). Renders a twinkling star
// background + flash layer; call `warp(onSwap)` to play the transition,
// swapping the page content via `onSwap` right as the flash peaks.
const STAR_COUNT = 22;
// 0.75x speed (i.e. ~1.33x the original 650ms duration) — slowed down on
// request, since the album/letter pages trigger this far more often than
// WishInput's one-time use, and the original pace felt a bit rushed there.
const WARP_DURATION_MS = 870;

type TwinkleStar = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
};

export function useWarpTransition() {
  const starsWrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [warping, setWarping] = useState(false);

  // Randomized once so the stars don't resync/restart on re-render.
  const stars = useMemo<TwinkleStar[]>(
    () =>
      Array.from({ length: STAR_COUNT }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 7,
        delay: Math.random() * 3,
        duration: 1.8 + Math.random() * 2.2,
      })),
    [],
  );

  function warp(onSwap: () => void) {
    if (warping) return;
    const starEls = starsWrapRef.current?.children;
    const content = contentRef.current;
    const flash = flashRef.current;
    if (!starEls || starEls.length === 0 || !content || !flash) {
      onSwap();
      return;
    }
    setWarping(true);

    // Pause the stars' looping CSS twinkle first — otherwise it keeps
    // overwriting `transform` every frame and fights with anime.js driving
    // the same property for the warp streak (same fix as WishInput.tsx).
    for (const el of starEls) {
      (el as HTMLElement).style.animationPlayState = "paused";
    }

    createTimeline({ defaults: { ease: "inQuad" } })
      .add(
        starEls,
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rotate: ((_el: Element, i: number) => {
            const s = stars[i];
            return (Math.atan2(s.top - 50, s.left - 50) * 180) / Math.PI;
          }) as any,
          scaleY: () => utils.random(8, 14),
          scaleX: 0.35,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          translateX: ((_el: Element, i: number) => `${(stars[i].left - 50) * 5}px`) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          translateY: ((_el: Element, i: number) => `${(stars[i].top - 50) * 5}px`) as any,
          opacity: [1, 0],
          duration: WARP_DURATION_MS,
          delay: stagger(8),
        },
        0,
      )
      .add(
        content,
        { opacity: [1, 0], scale: [1, 1.08], duration: WARP_DURATION_MS * 0.6 },
        0,
      )
      .add(
        flash,
        {
          opacity: [0, 0.6, 0],
          scale: [0.5, 2.2],
          duration: WARP_DURATION_MS,
          onComplete: () => {
            onSwap();
            // Reset for the next warp: undo the inline transforms/opacity
            // anime.js left behind, resume the idle twinkle loop, and fade
            // the (now-new) content back in.
            for (const el of starEls) {
              const style = (el as HTMLElement).style;
              style.animationPlayState = "";
              style.transform = "";
              style.opacity = "";
            }
            createTimeline({ defaults: { ease: "outQuad" } }).add(content, {
              opacity: [0, 1],
              scale: [1.02, 1],
              duration: 530,
            });
            setWarping(false);
          },
        },
        0,
      );
  }

  const starsLayer = (
    <div
      ref={starsWrapRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      {stars.map((star, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-gold"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );

  const flashLayer = (
    <div
      ref={flashRef}
      className="pointer-events-none absolute inset-0 z-20 opacity-0"
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(176,141,79,0.55) 45%, rgba(176,141,79,0) 75%)",
      }}
      aria-hidden="true"
    />
  );

  return { starsLayer, flashLayer, contentRef, warp, warping };
}
