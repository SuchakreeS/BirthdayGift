"use client";

import { useMemo, useRef, useState } from "react";
import { createTimeline } from "animejs";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjybrpwa";
const STAR_COUNT = 26;
// How long the starfield/text plays before settling into the calm end
// screen and revealing the button onward to the letter pages.
const SETTLE_DELAY_MS = 4200;

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
  const [settled, setSettled] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

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
      setTimeout(() => setSettled(true), SETTLE_DELAY_MS);
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-wine-deep px-6 animate-rise-in">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
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

        <p
          ref={textRef}
          className="relative z-10 text-center font-display text-2xl tracking-wide text-ivory opacity-0"
        >
          Your wish shall be granted
        </p>

        {settled && (
          <button
            type="button"
            onClick={onContinue}
            className="animate-soft-reveal relative z-10 mt-10 font-body text-sm text-gold underline underline-offset-4"
          >
            Continue →
          </button>
        )}
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
