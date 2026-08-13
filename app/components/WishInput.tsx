"use client";

import { useMemo, useRef, useState } from "react";
import { createTimeline, stagger, utils } from "animejs";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjybrpwa";
const STAR_COUNT = 26;
// How long the starfield/text plays before the warp transition kicks off.
const SETTLE_DELAY_MS = 4200;
// Duration of the warp-speed transition itself, before onContinue fires.
const WARP_DURATION_MS = 650;

type TwinkleStar = {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
};

export default function WishInput({ onContinue }: { onContinue: () => void }) {
  const [wish, setWish] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const textRef = useRef<HTMLParagraphElement>(null);
  const starsWrapRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  // Randomized once so the stars don't resync/restart on re-render.
  const stars = useMemo<TwinkleStar[]>(
    () =>
      Array.from({ length: STAR_COUNT }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 6 + Math.random() * 10,
        delay: Math.random() * 3,
        duration: 1.8 + Math.random() * 2.2,
      })),
    [],
  );

  // Warp-speed transition into the next screen: the twinkling stars stretch
  // into radial streaks and rocket outward (rotated to point away from
  // center, elongated, translated along that same direction), the text
  // zooms/fades, and a bright flash peaks — classic hyperspace-jump look.
  // onContinue fires once the flash animation completes.
  function triggerWarp() {
    const starEls = starsWrapRef.current?.children;
    const text = textRef.current;
    const flash = flashRef.current;
    if (!starEls || starEls.length === 0 || !text || !flash) {
      onContinue();
      return;
    }

    // Pause the stars' looping CSS twinkle animation first — otherwise it
    // keeps overwriting `transform` every frame and fights with anime.js
    // driving the same property for the warp streak.
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
          scaleY: () => utils.random(10, 18),
          scaleX: 0.35,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          translateX: ((_el: Element, i: number) => `${(stars[i].left - 50) * 6}px`) as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          translateY: ((_el: Element, i: number) => `${(stars[i].top - 50) * 6}px`) as any,
          opacity: [1, 0],
          duration: WARP_DURATION_MS,
          delay: stagger(10),
        },
        0,
      )
      .add(
        text,
        {
          opacity: [1, 0],
          scale: [1, 1.15],
          duration: WARP_DURATION_MS * 0.6,
        },
        0,
      )
      .add(
        flash,
        {
          opacity: [0, 0.6, 0],
          scale: [0.5, 2.2],
          duration: WARP_DURATION_MS,
          onComplete: onContinue,
        },
        0,
      );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wish.trim() || status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wish }),
      });
      if (!res.ok) throw new Error("Formspree request failed");

      setStatus("sent");
      requestAnimationFrame(() => {
        if (!textRef.current) return;
        createTimeline({ defaults: { ease: "outQuad" } }).add(textRef.current, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 1400,
        });
      });
      setTimeout(triggerWarp, SETTLE_DELAY_MS);
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-wine-deep px-6 animate-rise-in">
        <div ref={starsWrapRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
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

        {/* Warp-transition flash — stays invisible until triggerWarp runs. */}
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 z-20 opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(176,141,79,0.55) 45%, rgba(176,141,79,0) 75%)",
          }}
          aria-hidden="true"
        />

        <p
          ref={textRef}
          className="relative z-10 text-center font-display text-2xl tracking-wide text-ivory opacity-0"
        >
          Your wish shall be granted
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 animate-rise-in">
      <p className="max-w-sm text-center font-display text-2xl text-wine-deep">
        ถ้าขอพรอะไรก็ได้ในวันเกิดปีนี้ อ้วนอยากจะขออะไร
      </p>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <textarea
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          rows={5}
          className="rounded-md border border-blush bg-ivory p-3 font-body text-sm text-ink focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-md bg-wine px-4 py-2 font-body text-sm text-ivory disabled:opacity-60"
        >
          {status === "sending" ? "กำลังส่ง..." : "ส่งพร"}
        </button>
        {status === "error" && (
          <p className="font-body text-xs text-wine-deep">
            ส่งไม่สำเร็จ ลองอีกครั้งนะ
          </p>
        )}
      </form>
    </div>
  );
}
