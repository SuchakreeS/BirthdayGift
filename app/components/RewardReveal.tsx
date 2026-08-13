"use client";

import { useMemo, useRef, useState } from "react";
import { createTimeline, stagger, utils } from "animejs";

const GLITTER_COUNT = 12;
const FALLING_STAR_COUNT = 22;

type FallingStar = {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  glyph: string;
};

export default function RewardReveal({ onContinue }: { onContinue: () => void }) {
  const [opened, setOpened] = useState(false);
  const lightRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const glitterWrapRef = useRef<HTMLDivElement>(null);

  // Randomized once per mount so the falling stars don't all fall in
  // lockstep — regenerating on every render would restart/desync them.
  const fallingStars = useMemo<FallingStar[]>(
    () =>
      Array.from({ length: FALLING_STAR_COUNT }, () => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 10,
        duration: 6 + Math.random() * 6,
        delay: Math.random() * 8,
        drift: (Math.random() - 0.5) * 60,
        glyph: Math.random() > 0.5 ? "✦" : "✧",
      })),
    [],
  );

  function handleOpen() {
    if (opened) return;
    const light = lightRef.current;
    const lid = lidRef.current;
    const ticket = ticketRef.current;
    const glitterPieces = glitterWrapRef.current?.children;
    if (!light || !lid || !ticket || !glitterPieces) return;

    setOpened(true);

    // Timeline auto-plays once created (default behavior).
    createTimeline({ defaults: { ease: "outQuad" } })
      .add(light, {
        opacity: [0, 1, 0],
        scale: [0.2, 1.9],
        duration: 700,
      })
      .add(
        lid,
        {
          rotateX: [0, -115],
          translateY: [0, -6],
          duration: 600,
        },
        "-=600", // light and lid open together, light leading slightly
      )
      .add(
        ticket,
        {
          opacity: [0, 1],
          scale: [0.3, 1],
          translateY: [30, -18],
          // Vertical-axis flip (like a card spinning around its center
          // line) instead of a flat clock-hand rotation — stays upright
          // and readable at rest, never looks tipped on its side mid-spin.
          rotateY: [0, 1080], // 3 full flips
          duration: 3400, // 0.5x speed of the previous 1700ms
          ease: "outElastic(1, .6)",
        },
        "-=200",
      )
      .add(
        glitterPieces,
        {
          opacity: [0, 1, 0],
          scale: [0, 1],
          translateX: () => utils.random(-90, 90),
          translateY: () => utils.random(-90, 90),
          duration: 900,
          delay: stagger(35),
          ease: "outQuad",
        },
        "-=2700", // same proportional overlap into the now-longer spin
      )
      .add(ticket, {
        translateY: [-18, 0],
        duration: 550,
        ease: "outBounce",
      });
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden px-6 animate-rise-in">
      {/* ambient falling stars in the background, starts once the box is
          opened and continues indefinitely */}
      {opened && (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
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
      )}

      <h1 className="relative z-10 font-display text-3xl text-wine-deep tracking-wide">
        Your Surprise
      </h1>

      <div
        className="relative z-10 flex h-56 w-56 items-center justify-center"
        style={{ perspective: "800px" }}
      >
        {/* shining light burst, flashes out as the box opens */}
        <div
          ref={lightRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255,238,199,0.95) 0%, rgba(176,141,79,0.55) 45%, rgba(176,141,79,0) 72%)",
          }}
        />

        {/* glitter particles, positioned centered, animated outward */}
        <div
          ref={glitterWrapRef}
          className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
        >
          {Array.from({ length: GLITTER_COUNT }).map((_, i) => (
            <span
              key={i}
              className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 text-lg text-gold opacity-0"
            >
              {i % 2 === 0 ? "✦" : "✧"}
            </span>
          ))}
        </div>

        {/* ticket, hidden inside the box until opened */}
        <div
          ref={ticketRef}
          className="pointer-events-none absolute z-10 flex w-44 flex-col items-center gap-1 rounded-md border-2 border-dashed border-gold bg-ivory px-4 py-5 text-center shadow-lg opacity-0"
        >
          <p className="font-display text-xl text-wine-deep">บัตรตามใจ</p>
          <p className="font-body text-[11px] leading-snug text-ink-soft">
            สามารถใช้บัตรใบนี้เพื่อให้เราตามใจได้
            <br />
            บัตรใบนี้มีผล 24 ชั่วโมง 
             <br />
            วันหมดอายุ:ไม่มี
          </p>
        </div>

        {/* box */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open your present"
          className="absolute bottom-0 flex h-32 w-40 flex-col items-center"
          style={{ transformStyle: "preserve-3d" }}
          disabled={opened}
        >
          <div
            ref={lidRef}
            className="absolute -top-6 z-20 h-8 w-44 rounded-sm bg-wine-deep shadow"
            style={{ transformOrigin: "top center" }}
          >
            <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold" />
          </div>
          <div className="relative h-32 w-40 rounded-sm bg-wine shadow-md">
            <span className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 bg-gold" />
          </div>
        </button>
      </div>

      <p className="relative z-10 font-body text-sm text-ink-soft">
        {opened ? "เปิดแล้ว ✦" : "Tap the box to open it"}
      </p>

      {/* Appears once the box-open/spin/glitter timeline has had time to
          finish (~3.95s) so she isn't rushed past the reveal. */}
      {opened && (
        <button
          type="button"
          onClick={onContinue}
          className="animate-soft-reveal relative z-10 font-body text-sm text-gold underline underline-offset-4"
          style={{ animationDelay: "4200ms" }}
        >
          Continue →
        </button>
      )}
    </div>
  );
}
