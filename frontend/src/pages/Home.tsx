import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="editorial-theme flex min-h-screen flex-col items-center justify-center bg-[#f3f2f2] px-6 text-center text-[#201e1d]">
      <img src="/logo.png" alt="Vantage" className="h-16 w-fit" />

      <span className="mt-8 rounded-full bg-[#0088b0]/10 px-4 py-1.5 text-sm font-medium text-[#0088b0]">
        Yapay Zeka Destekli Proje Yönetimi
      </span>

      <h1 className="mt-6 max-w-2xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
        İşinizi net görün, ekibinizi bir adım önde tutun.
      </h1>

      <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#201e1d]/70">
        Hoş geldin, {user?.email}. Ne yapmak istersin?
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/dashboard/workspace"
          className="flex min-h-10 items-center rounded-[3px] bg-[#0088b0] px-6 text-sm font-semibold text-[#f3f2f2] hover:bg-[#1186ac]"
        >
          Çalışma Alanına Git
        </Link>
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="h-10 rounded-[3px] border-[#201e1d]/15 px-6 text-[#201e1d] hover:bg-[#201e1d]/5"
        >
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
