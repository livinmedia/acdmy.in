import Link from "next/link";

const CATEGORY_GRADIENTS: Record<string, string> = {
  fundamentals: "from-[#1a1040] to-[#2d1b69]",
  prompting: "from-[#1a1040] to-[#2d1b69]",
  agents: "from-[#0a2a1e] to-[#134e3a]",
  rag: "from-[#0a1a2a] to-[#10344e]",
  "fine-tuning": "from-[#2a1a0a] to-[#4a2a10]",
  mlops: "from-[#2a0a1a] to-[#4a102a]",
};

const CATEGORY_EMOJI: Record<string, string> = {
  fundamentals: "🧠",
  prompting: "💬",
  agents: "⚡",
  rag: "🔍",
  "fine-tuning": "🔧",
  mlops: "🚀",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-[#34d399] bg-[#34d399]/10 border-[#34d399]/20",
  intermediate: "text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20",
  advanced: "text-[#f472b6] bg-[#f472b6]/10 border-[#f472b6]/20",
};

interface CourseCardProps {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  lesson_count: number;
  estimated_minutes: number;
}

export default function CourseCard({
  slug,
  title,
  description,
  category,
  difficulty,
  lesson_count,
  estimated_minutes,
}: CourseCardProps) {
  const gradient = CATEGORY_GRADIENTS[category] ?? "from-[#1a1040] to-[#2d1b69]";
  const emoji = CATEGORY_EMOJI[category] ?? "📚";
  const diffColor = DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.beginner;

  return (
    <Link
      href={`/courses/${slug}`}
      className="group bg-[#111114] border border-[#222228] rounded-2xl overflow-hidden hover:border-[#333340] hover:-translate-y-0.5 transition-all"
    >
      <div
        className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center text-5xl`}
      >
        {emoji}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-[#a78bfa]">
            {category}
          </span>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${diffColor}`}
          >
            {difficulty}
          </span>
        </div>
        <h3 className="text-[15px] font-semibold text-white mb-1.5 group-hover:text-[#a78bfa] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#8a8994] leading-relaxed line-clamp-2">
          {description}
        </p>
        <div className="flex gap-4 mt-3 font-[family-name:var(--font-jetbrains)] text-[11px] text-[#55545e]">
          <span>{lesson_count} lessons</span>
          <span>~{estimated_minutes} min</span>
        </div>
      </div>
    </Link>
  );
}
