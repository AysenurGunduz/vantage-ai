import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="dark-theme relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d1b3a] px-6 text-center text-white">
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-[#ff6b5b]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-0 right-1/4 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

      <Logo className="relative z-10 scale-125" />

      <span className="relative z-10 mt-8 rounded-full bg-[#ff6b5b]/10 px-4 py-1.5 text-sm font-medium text-[#ff6b5b]">
        Yapay Zeka Destekli Proje Yönetimi
      </span>

      <h1 className="relative z-10 mt-6 max-w-2xl text-4xl leading-tight font-bold text-balance sm:text-5xl">
        İşinizi net görün, ekibinizi bir adım önde tutun.
      </h1>

      <p className="relative z-10 mt-4 max-w-xl text-lg leading-relaxed text-white/70">
        Hoş geldin, {user?.email}. Ne yapmak istersin?
      </p>

      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/dashboard/workspace"
          className="flex min-h-10 items-center rounded-[3px] bg-[#ff6b5b] px-6 text-sm font-semibold text-[#0d1b3a] hover:bg-[#ff8577]"
        >
          Çalışma Alanına Git
        </Link>
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="h-10 rounded-[3px] border-white/20 bg-transparent px-6 text-white hover:bg-white/5"
        >
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
