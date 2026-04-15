"use client";

import { createClient } from "@/lib/supabase/client";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string | null;
}

interface CourseResourcesProps {
  resources: Resource[];
}

export default function CourseResources({ resources }: CourseResourcesProps) {
  if (!resources || resources.length === 0) return null;

  async function handleClick(resourceId: string) {
    const supabase = createClient();
    // fire and forget
    supabase.rpc("increment_download", { resource_id: resourceId });
  }

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-white mb-4">Downloads</h2>
      <div className="space-y-2">
        {resources.map((r) => (
          <a
            key={r.id}
            href={r.file_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleClick(r.id)}
            className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-colors group"
          >
            <span className="text-2xl shrink-0">📄</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                {r.title}
              </p>
              {r.description && (
                <p className="text-xs text-white/50 mt-0.5 truncate">
                  {r.description}
                </p>
              )}
            </div>
            <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-[#34d399] shrink-0">
              {(r.file_type || "PDF").toUpperCase()} ↓
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
