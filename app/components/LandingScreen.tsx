"use client";

import { useState } from "react";

const BALLOONS: {
  left: string;
  color: string;
  size: number;
  delay: string;
  duration: string;
  drift: string;
}[] = [
  { left: "4%", color: "var(--color-wine)", size: 46, delay: "0s", duration: "11s", drift: "18px" },
  { left: "14%", color: "var(--color-gold)", size: 36, delay: "2.4s", duration: "9s", drift: "-14px" },
  { left: "24%", color: "var(--color-blush)", size: 42, delay: "5.1s", duration: "12s", drift: "10px" },
  { left: "36%", color: "var(--color-wine)", size: 34, delay: "1.2s", duration: "10s", drift: "-20px" },
  { left: "48%", color: "var(--color-gold)", size: 44, delay: "6.3s", duration: "13s", drift: "16px" },
  { left: "58%", color: "var(--color-blush)", size: 38, delay: "3.6s", duration: "9.5s", drift: "-12px" },
  { left: "68%", color: "var(--color-wine)", size: 40, delay: "0.8s", duration: "11.5s", drift: "14px" },
  { left: "78%", color: "var(--color-gold)", size: 34, delay: "4.5s", duration: "10.5s", drift: "-18px" },
  { left: "88%", color: "var(--color-blush)", size: 46, delay: "7.2s", duration: "12.5s", drift: "20px" },
  { left: "94%", color: "var(--color-wine)", size: 32, delay: "2s", duration: "9s", drift: "-10px" },
];

const FLAG_COLORS = ["var(--color-wine)", "var(--color-gold)", "var(--color-blush)"];
const ROTATIONS = [-3, 2, -2, 3, -1, 1];

function Bunting({ text, flagSize }: { text: string; flagSize: number }) {
  const chars = text.split("");
  return (
    <div className="relative flex items-start justify-center">
      <div
        className="absolute left-0 right-0 top-0 border-t-2 border-dashed"
        style={{ borderColor: "var(--color-gold)" }}
      />
      <div className="flex pt-[2px]">
        {chars.map((ch, i) => {
          if (ch === " ") {
            return <div key={i} style={{ width: flagSize * 0.6 }} />;
          }
          const bg = FLAG_COLORS[i % FLAG_COLORS.length];
          const rotate = ROTATIONS[i % ROTATIONS.length];
          const isBlush = bg === "var(--color-blush)";
          return (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ width: flagSize + 6 }}
            >
              <div
                className="h-2 w-px"
                style={{ background: "var(--color-gold)" }}
              />
              <div
                className="flex items-center justify-center rounded-sm border font-display font-semibold shadow-sm"
                style={{
                  width: flagSize,
                  height: flagSize,
                  background: bg,
                  borderColor: "var(--color-gold)",
                  color: isBlush ? "var(--color-wine-deep)" : "var(--color-ivory)",
                  fontSize: flagSize * 0.5,
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                {ch}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LandingScreen({ onEnter }: { onEnter: () => void }) {
  const [transitioning, setTransitioning] = useState(false);

  function handleEnter() {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(onEnter, 2200);
  }

  return (
    <div
      onClick={handleEnter}
      className="relative min-h-screen cursor-pointer overflow-hidden bg-ivory"
    >
      <div className={transitioning ? "animate-walk-closer" : ""}>
        {/* Balloons */}
        <div className="pointer-events-none absolute inset-0">
          {BALLOONS.map((b, i) => (
            <div
              key={i}
              className="animate-balloon-float absolute bottom-[-10vh]"
              style={
                {
                  left: b.left,
                  animationDelay: b.delay,
                  animationDuration: b.duration,
                  "--drift": b.drift,
                } as React.CSSProperties
              }
            >
              <div
                className="rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-md"
                style={{ width: b.size, height: b.size * 1.15, background: b.color }}
              />
              <div
                className="mx-auto h-14 w-px opacity-40"
                style={{ background: "var(--color-ink-soft)" }}
              />
            </div>
          ))}
        </div>

        {/* Hanging banner */}
        <div className="animate-banner-sway absolute left-1/2 top-0 -translate-x-1/2 pt-6">
          <Bunting text="HAPPY BIRTHDAY" flagSize={34} />
          <div className="mt-4">
            <Bunting text="my BELOVED" flagSize={30} />
          </div>
        </div>

        {/* Bottom instruction */}
        <div className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 px-6 text-center">
          <p className="animate-pulse-soft font-body text-sm tracking-wide text-ink-soft">
            แตะที่ไหนก็ได้เพื่อเข้าไป
          </p>
        </div>
      </div>
    </div>
  );
}
