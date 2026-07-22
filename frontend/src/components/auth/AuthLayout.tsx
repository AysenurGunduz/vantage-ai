import type { ReactNode } from "react";
import { KanbanSquare, Sparkles, Users } from "lucide-react";

const features = [
  { icon: KanbanSquare, text: "Kanban tabanlı proje ve görev yönetimi", accent: "#0088b0" },
  { icon: Sparkles, text: "Yapay zeka destekli görev bölme ve öncelik analizi", accent: "#d6006c" },
  { icon: Users, text: "Takım çalışma tarzı ve gecikme riski öngörüleri", accent: "#0088b0" },
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
    <div className="editorial-theme flex min-h-screen bg-[#f3f2f2] text-[#201e1d]">
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-[#201e1d]/10 p-12 lg:flex">
        <img src="/logo.png" alt="Vantage" className="h-10 w-fit" />

        <div className="max-w-md space-y-8">
          <h1 className="cmyk-head text-5xl leading-[1.1] font-semibold tracking-tight text-balance">
            <span className="paper">{headline}</span>
            <span className="plate plate-c" aria-hidden="true">
              {headline}
            </span>
            <span className="plate plate-m" aria-hidden="true">
              {headline}
            </span>
            <span className="plate plate-y" aria-hidden="true">
              {headline}
            </span>
          </h1>
          <p className="text-lg text-[#201e1d]/70 text-balance">{subtitle}</p>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text, accent }) => (
              <li
                key={text}
                className="flex items-start gap-3 border-l-2 pl-4"
                style={{ borderColor: accent }}
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-[#201e1d]/60" />
                <span className="text-[#201e1d]/80">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <span className="text-sm text-[#201e1d]/40">Vantage &mdash; Yapay Zeka Destekli Proje Yönetimi</span>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <img src="/logo.png" alt="Vantage" className="mb-10 h-10 w-fit lg:hidden" />
          {children}
        </div>
      </div>
    </div>
  );
}
