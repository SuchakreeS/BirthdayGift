"use client";

import { useEffect, useState } from "react";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
};

const QUESTIONS: Question[] = [
  {
    question: "จังหวัดแรกที่ได้ไปเที่ยวแบบค้างคืนด้วยกัน",
    options: ["เพชรบุรี", "สุพรรณบุรี", "กาญจนบุรี", "อะไรซักอย่างบุรี"],
    correctAnswer: "เพชรบุรี",
  },
  {
    question: "จูบแรกเกิดขึ้นที่ไหนนนน",
    options: ["เพชรบุรี", "หัวหิน", "จันท", "ที่ไหนก็ได้ โตแล้ว"],
    correctAnswer: "จันท",
  },
  {
    question: "บุคคลแรกที่รู้เรื่องตอนเริ่มคบกันคืออออ",
    options: ["น้ำทิพย์ (สาระแนนักนะ)", "เปีย", "จิว", "น้ำหวาน"],
    correctAnswer: "น้ำทิพย์ (สาระแนนักนะ)",
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizScreen({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const question = QUESTIONS[index];

  useEffect(() => {
    setChoices(shuffle(question.options));
    setFeedback(null);
    setSelected(null);
  }, [index, question.options]);

  function handleSelect(option: string) {
    if (feedback) return;
    setSelected(option);
    const isCorrect = option === question.correctAnswer;
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setTimeout(() => {
        if (index < QUESTIONS.length - 1) {
          setIndex((i) => i + 1);
        } else {
          onComplete();
        }
      }, 1300);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setSelected(null);
      }, 900);
    }
  }

  return (
    <div
      className={`flex min-h-screen flex-col items-center justify-center gap-8 px-6 animate-rise-in ${
        feedback === "wrong" ? "animate-shake" : ""
      }`}
    >
      <p className="font-body text-xs uppercase tracking-widest text-ink-soft">
        Question {index + 1} of {QUESTIONS.length}
      </p>

      <h1 className="max-w-sm text-center font-display text-2xl text-wine-deep">
        {question.question}
      </h1>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {choices.map((option) => {
          const isSelected = selected === option;
          const showCorrect = feedback === "correct" && isSelected;
          const showWrong = feedback === "wrong" && isSelected;
          return (
            <button
              key={option}
              type="button"
              disabled={feedback !== null}
              onClick={() => handleSelect(option)}
              className={`rounded-md border px-4 py-3 text-left font-body text-base transition-colors ${
                showCorrect
                  ? "animate-sparkle border-gold bg-blush text-ink"
                  : showWrong
                    ? "border-wine bg-blush text-wine-deep"
                    : "border-blush bg-white text-ink hover:border-gold"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <p
        className={`min-h-6 font-body text-sm ${
          feedback === "correct"
            ? "animate-soft-reveal text-gold"
            : feedback === "wrong"
              ? "animate-soft-reveal text-wine"
              : "invisible"
        }`}
      >
        {feedback === "correct"
          ? "เป็นคำตอบที่ถูกต้องนะค้าบบบบ"
          : feedback === "wrong"
            ? "เป็นคำตอบที่ยังม่ายช่ายยยย"
            : " "}
      </p>
    </div>
  );
}
