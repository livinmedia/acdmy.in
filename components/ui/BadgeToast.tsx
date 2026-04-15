"use client";

import { useEffect, useState } from "react";
import { BADGES } from "@/lib/badges";

interface BadgeToastProps {
  badgeTypes: string[];
}

export default function BadgeToast({ badgeTypes }: BadgeToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (badgeTypes.length === 0) return;
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [badgeTypes]);

  if (badgeTypes.length === 0 || !visible) return null;

  const badge = BADGES[badgeTypes[0]];
  if (!badge) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-[#111114] border border-[#34d399]/30 rounded-xl px-5 py-4 shadow-lg shadow-black/40 flex items-center gap-3 max-w-sm">
        <span className="text-3xl">{badge.emoji}</span>
        <div>
          <p className="text-sm font-semibold text-white">Badge Earned!</p>
          <p className="text-xs text-[#8a8994]">
            {badge.label} &mdash; {badge.description}
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/30 hover:text-white/60 ml-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
