import type { ReactNode } from "react";
import { KanbanSquare, Sparkles, Users } from "lucide-react";

const features = [
  { icon: KanbanSquare, text: "Kanban tabanlı proje ve görev yönetimi" },
  { icon: Sparkles, text: "Yapay zeka destekli görev bölme ve öncelik analizi" },
  { icon: Users, text: "Takım çalışma tarzı ve gecikme riski öngörüleri" },
];

export function AuthLayout({
  headline,
  subtitle,
  children,
}: {
  headline: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-12 lg:flex">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 right-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 max-w-md space-y-8">
          <h1 className="text-4xl leading-tight font-bold text-white text-balance">{headline}</h1>
          <p className="text-lg text-white/70 text-balance">{subtitle}</p>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-white/80">
                <Icon className="mt-0.5 size-5 shrink-0 text-amber-400" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <span className="relative z-10 text-sm text-white/40">Vantage &mdash; Yapay Zeka Destekli Proje Yönetimi</span>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <img src="/logo.png" alt="Vantage" className="mb-10 h-12" />
          {children}
        </div>
      </div>
    </div>
  );
}
