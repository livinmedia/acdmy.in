"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  sort_order: number | null;
}

interface LessonQuizProps {
  quizzes: Quiz[];
  lessonId: string;
  userId: string | null;
}

interface AnswerRecord {
  quiz_id: string;
  selected: number;
  correct: boolean;
}

export default function LessonQuiz({
  quizzes,
  lessonId,
  userId,
}: LessonQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!quizzes || quizzes.length === 0) return null;

  const total = quizzes.length;
  const current = quizzes[currentIdx];
  const score = answers.filter((a) => a.correct).length;

  function handleSelect(index: number) {
    if (revealed) return;
    setSelected(index);
  }

  function handleSubmit() {
    if (selected === null) return;
    const correct = selected === current.correct_index;
    setAnswers([
      ...answers,
      { quiz_id: current.id, selected, correct },
    ]);
    setRevealed(true);
  }

  async function handleNext() {
    if (currentIdx < total - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      // Finished — save attempt
      setFinished(true);
      if (userId && !saved) {
        const supabase = createClient();
        await supabase.from("quiz_attempts").insert({
          student_id: userId,
          lesson_id: lessonId,
          score,
          total,
          answers,
          completed_at: new Date().toISOString(),
        });
        setSaved(true);
      }
    }
  }

  function handleRetry() {
    setCurrentIdx(0);
    setSelected(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
    setSaved(false);
  }

  // ── Results screen ─────────────────────────────────────────────
  if (finished) {
    const percent = Math.round((score / total) * 100);
    const passed = percent >= 70;

    return (
      <div className="my-10 bg-[#111114] border border-[#222228] rounded-2xl p-8 text-center">
        <div className="text-5xl mb-3">{passed ? "\uD83C\uDF89" : "\uD83D\uDCDA"}</div>
        <h3 className="text-xl font-bold text-white mb-2">
          {passed ? "Quiz complete!" : "Keep going!"}
        </h3>
        <p className="text-[#8a8994] mb-1">
          You got{" "}
          <span className="text-white font-semibold">
            {score} of {total}
          </span>{" "}
          correct
        </p>
        <p className="font-[family-name:var(--font-jetbrains)] text-3xl text-[#34d399] my-4">
          {percent}%
        </p>

        <button
          onClick={handleRetry}
          className="px-5 py-2.5 rounded-xl border border-white/20 text-white/80 text-sm font-medium hover:bg-white/5 hover:border-white/30 transition-all"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  // ── Quiz question screen ───────────────────────────────────────
  return (
    <div className="my-10 bg-[#111114] border border-[#222228] rounded-2xl p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)] text-[#a78bfa]">
            Quiz
          </span>
          <span className="text-xs text-[#55545e]">
            {currentIdx + 1} / {total}
          </span>
        </div>
        <div className="flex-1 ml-4 h-1 bg-white/10 rounded-full overflow-hidden max-w-[200px]">
          <div
            className="h-full bg-[#a78bfa] rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-base font-semibold text-white leading-relaxed mb-5">
        {current.question}
      </h3>

      {/* Options */}
      <div className="space-y-2 mb-5">
        {current.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === current.correct_index;
          const showCorrect = revealed && isCorrect;
          const showIncorrect = revealed && isSelected && !isCorrect;

          let classes =
            "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ";
          if (showCorrect) {
            classes +=
              "border-[#34d399]/50 bg-[#34d399]/10 text-white";
          } else if (showIncorrect) {
            classes += "border-rose-400/50 bg-rose-400/10 text-white";
          } else if (isSelected) {
            classes +=
              "border-[#a78bfa]/50 bg-[#a78bfa]/10 text-white";
          } else {
            classes +=
              "border-white/10 bg-white/[0.02] text-white/80 hover:bg-white/[0.05] hover:border-white/20";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={revealed}
              className={classes}
            >
              <div className="flex items-center gap-3">
                <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-white/40 w-5">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
                {showCorrect && (
                  <svg
                    className="w-5 h-5 text-[#34d399] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {showIncorrect && (
                  <svg
                    className="w-5 h-5 text-rose-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && current.explanation && (
        <div className="mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <p className="text-xs uppercase tracking-wider font-[family-name:var(--font-jetbrains)] text-[#a78bfa] mb-1.5">
            Explanation
          </p>
          <p className="text-sm text-white/70 leading-relaxed">
            {current.explanation}
          </p>
        </div>
      )}

      {/* Action */}
      <div className="flex justify-end">
        {!revealed ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="px-5 py-2.5 rounded-xl bg-[#a78bfa] hover:bg-[#9475f0] text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium transition-colors"
          >
            {currentIdx < total - 1 ? "Next Question" : "Finish Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}
