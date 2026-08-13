"use client";

import { useEffect, useRef, useState } from "react";
import Seal from "./Seal";
import Keypad from "./Keypad";

const PIN = "0803";
const HINTS = ["เลขที่เธอก็รู้", "มีเลขซ้ำ 1 ตัว", "ครบรอบ"];

export default function PinScreen({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [shake, setShake] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function setDigitAt(index: number, value: string) {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (next.every((d) => d !== "")) {
      checkPin(next.join(""));
    }
    return next;
  }

  function handleChange(index: number, value: string) {
    const clean = value.replace(/[^0-9]/g, "").slice(-1);
    setDigitAt(index, clean);
    if (clean && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handleKeypadDigit(digit: string) {
    const firstEmpty = digits.findIndex((d) => d === "");
    if (firstEmpty === -1) return;
    setDigitAt(firstEmpty, digit);
  }

  function handleKeypadBackspace() {
    const lastFilled = [...digits].reverse().findIndex((d) => d !== "");
    if (lastFilled === -1) return;
    const index = digits.length - 1 - lastFilled;
    const next = [...digits];
    next[index] = "";
    setDigits(next);
  }

  function checkPin(value: string) {
    if (value === PIN) {
      onUnlock();
      return;
    }
    setShake(true);
    setHintsShown((n) => Math.min(n + 1, HINTS.length));
    setTimeout(() => {
      setShake(false);
      setDigits(["", "", "", ""]);
      inputsRef.current[0]?.focus();
    }, 500);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 animate-rise-in">
      <Seal />

      <div className="text-center">
        <h1 className="font-display text-3xl text-wine-deep tracking-wide">
          For You
        </h1>
        <p className="mt-2 font-body text-sm text-ink-soft">
          Enter the 4-digit code to continue
        </p>
      </div>

      <div className={`flex gap-3 ${shake ? "animate-shake" : ""}`}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            readOnly={isMobile}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-14 w-12 rounded-md border border-blush bg-white text-center font-display text-2xl text-ink outline-none transition-colors focus:border-gold"
            autoFocus={i === 0 && !isMobile}
          />
        ))}
      </div>

      {isMobile && (
        <Keypad onDigit={handleKeypadDigit} onBackspace={handleKeypadBackspace} />
      )}

      <div className="flex flex-col items-center gap-2">
        {HINTS.map((hint, i) => (
          <p
            key={i}
            className={`font-body text-sm text-ink-soft ${
              i < hintsShown ? "animate-soft-reveal" : "invisible"
            }`}
          >
            {hint}
          </p>
        ))}
      </div>
    </div>
  );
}
