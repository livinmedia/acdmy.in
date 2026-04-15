"use client";

interface VideoPlayerProps {
  videoUrl?: string | null;
  youtubeId?: string | null;
  title: string;
}

export default function VideoPlayer({ videoUrl, youtubeId, title }: VideoPlayerProps) {
  if (youtubeId) {
    return (
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        controls
        playsInline
        className="w-full aspect-video rounded-xl bg-black"
        title={title}
      />
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl bg-[#111114] border border-[#222228] flex items-center justify-center">
      <p className="text-xs text-[#55545e]">No video available</p>
    </div>
  );
}
