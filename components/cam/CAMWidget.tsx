"use client";

import { useState } from "react";
import CAMChat from "./CAMChat";

interface ChatWidgetProps {
  studentId?: string;
}

export default function CAMWidget({ studentId }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat panel */}
      {open && (
        <div className="mb-3 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.08] animate-in slide-in-from-bottom-4 fade-in duration-200">
          <CAMChat studentId={studentId} compact />
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="ml-auto flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#7c6cf0] to-[#5bbfef] shadow-lg shadow-[#7c6cf0]/25 hover:shadow-[#7c6cf0]/40 hover:scale-105 transition-all"
      >
        {open ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <span className="text-white text-lg font-extrabold">C</span>
        )}
      </button>
    </div>
  );
}
