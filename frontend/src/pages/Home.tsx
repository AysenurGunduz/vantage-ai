import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { Logo } from "@/components/Logo";
import { NetworkBackground } from "@/components/NetworkBackground";

export default function Home() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dark-theme animated-gradient relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center text-white">
      <NetworkBackground className="opacity-60" />
      <div className="floating-blob pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#ff6b5b]/15 blur-3xl" />
      <div className="floating-blob-reverse pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

      <div ref={menuRef} className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          title={user?.email}
          className="flex size-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          {user?.email?.[0]?.toUpperCase() ?? "?"}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 rounded-[4px] border border-white/10 bg-[#0f2044] p-1.5 text-left text-sm shadow-2xl shadow-black/50">
            <p className="truncate px-2.5 py-1.5 text-xs text-white/40">{user?.email}</p>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-[3px] px-2.5 py-2 text-left text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="size-4" />
              Çıkış Yap
            </button>
          </div>
        )}
      </div>

      <Logo className="page-fade-in relative z-10 scale-125" />

      <span className="page-fade-in relative z-10 mt-8 rounded-full bg-[#ff6b5b]/10 px-4 py-1.5 text-sm font-medium text-[#ff6b5b]">
        Yapay Zeka Destekli Proje Yönetimi
      </span>

      <h1 className="page-fade-in relative z-10 mt-6 max-w-2xl text-4xl leading-tight font-bold text-balance sm:text-5xl">
        İşinizi net görün, ekibinizi bir adım önde tutun.
      </h1>

      <p className="page-fade-in relative z-10 mt-4 max-w-xl text-lg leading-relaxed text-white/70">
        Hoş geldin, {user?.email}. Ne yapmak istersin?
      </p>

      <div className="page-fade-in relative z-10 mt-8">
        <Link
          to="/dashboard/workspace"
          className="group inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-[#ff6b5b] px-7 text-sm font-semibold text-[#0d1b3a] shadow-lg shadow-[#ff6b5b]/20 transition-all hover:bg-[#ff8577] hover:shadow-xl hover:shadow-[#ff6b5b]/30"
        >
          Hemen Başla
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
