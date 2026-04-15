import { BADGES } from "@/lib/badges";

interface BadgeGridProps {
  earnedBadges: { badge_type: string; earned_at: string }[];
}

export default function BadgeGrid({ earnedBadges }: BadgeGridProps) {
  const earnedMap = new Map(
    earnedBadges.map((b) => [b.badge_type, b.earned_at])
  );

  return (
    <div>
      <h2 className="text-sm font-semibold text-white mb-4">Badges</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {Object.entries(BADGES).map(([type, badge]) => {
          const earnedAt = earnedMap.get(type);
          const earned = !!earnedAt;

          return (
            <div
              key={type}
              className={`rounded-xl p-3 text-center transition-all ${
                earned
                  ? "bg-white/[0.05] border border-white/10"
                  : "bg-white/[0.02] border border-white/5 opacity-40"
              }`}
              title={badge.description}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <p className="text-[11px] font-medium text-white/70 mt-1.5 leading-tight">
                {badge.label}
              </p>
              {earned && earnedAt && (
                <p className="text-[9px] text-white/30 mt-0.5">
                  {new Date(earnedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
