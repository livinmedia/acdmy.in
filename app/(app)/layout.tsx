import NavBar from "@/components/ui/NavBar";
import CAMWidget from "@/components/cam/CAMWidget";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a10]">
      <NavBar />
      {children}
      <CAMWidget />
    </div>
  );
}
