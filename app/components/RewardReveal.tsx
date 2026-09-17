"use client";

import { useMemo, useRef, useState } from "react";
import { createTimeline } from "animejs";
import RewardBox3D, { REWARD_BOX_ANIMATION_MS } from "./RewardBox3D";

const FALLING_STAR_COUNT = 22;
// Ticket text overlay fades in as the 3D ticket card finishes settling,
// and the Continue button follows shortly after — mirrors the old
// animejs-timeline pacing, just timed off the model's clip length now.
const TICKET_TEXT_DELAY_MS = REWARD_BOX_ANIMATION_MS - 300;
const CONTINUE_DELAY_MS = REWARD_BOX_ANIMATION_MS + 250;

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
    if (!light) return;

    setOpened(true);

    // The box-open/lid/ticket-spin sequence itself now lives in the .glb's
    // baked animation clips (see RewardBox3D) — this timeline just keeps
    // the 2D light-burst flash layered on top of it.
    createTimeline({ defaults: { ease: "outQuad" } }).add(light, {
      opacity: [0, 1, 0],
      scale: [0.2, 1.9],
      duration: 700,
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

      <div className="relative z-10 h-80 w-80">
        {/* shining light burst, flashes out as the box opens */}
        <div
          ref={lightRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255,238,199,0.95) 0%, rgba(176,141,79,0.55) 45%, rgba(176,141,79,0) 72%)",
          }}
        />

        {/* the 3D gift box — its own baked animation plays the lid
            opening and the ticket rising/spinning out once `opened` */}
        <div className="absolute inset-0 z-10">
          <RewardBox3D playing={opened} />
        </div>

        {/* ticket text overlay — the .glb's ticket card is a plain
            (textureless) mesh, so the "บัตรตามใจ" copy is a separate
            HTML card faded in once the 3D ticket has risen into place.
            Positioning is a first-pass guess against the model's final
            ticket height, not yet confirmed live. */}
        {opened && (
          <div
            className="animate-soft-reveal pointer-events-none absolute left-1/2 top-[38%] z-20 flex w-44 -translate-x-1/2 flex-col items-center gap-1 text-center"
            style={{ animationDelay: `${TICKET_TEXT_DELAY_MS}ms` }}
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
        )}

        {/* invisible tap target over the whole scene */}
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open your present"
          className="absolute inset-0 z-30"
          disabled={opened}
        />
      </div>

      <p className="relative z-10 font-body text-sm text-ink-soft">
        {opened ? "เปิดแล้ว ✦" : "Tap the box to open it"}
      </p>

      {/* Appears once the box-open/ticket-spin animation has had time to
          finish (~3.96s, from the model's own clips) so she isn't rushed
          past the reveal. */}
      {opened && (
        <button
          type="button"
          onClick={onContinue}
          className="animate-soft-reveal relative z-10 font-body text-sm text-gold underline underline-offset-4"
          style={{ animationDelay: `${CONTINUE_DELAY_MS}ms` }}
        >
          Continue →
        </button>
      )}
    </div>
  );
}
