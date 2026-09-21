"use client";

import { useEffect } from "react";

// How long the two lines show before auto-advancing into the quiz.
const AUTO_ADVANCE_MS = 3000;

// Brief interstitial between the PIN unlock and the quiz — sets up why
// there's a quiz at all ("but how do we know it's really you? answer this
// first"). Auto-advances, no tap needed.
export default function TrustCheck({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onContinue, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 animate-rise-in">
      <p className="max-w-sm text-center font-display text-2xl text-wine-deep">
        แต่ เราจะแน่ใจได้ยังไงว่าเป็นเทอจริง
      </p>
      <p
        className="max-w-sm animate-soft-reveal text-center font-display text-xl text-wine-deep"
        style={{ animationDelay: "0.6s" }}
      >
        ลองตอบคำถามมาก่อนนะ
      </p>
    </div>
  );
}
