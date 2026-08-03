import type { ReactNode } from "react";
import { KanbanSquare, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

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
    <div className="light-theme relative flex min-h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-[var(--surface-border)] bg-[var(--bg-accent)] p-12 lg:flex">
        <Reveal>
          <Logo className="relative z-10" theme="light" />
        </Reveal>

        <div className="relative z-10 max-w-md space-y-8">
          <Reveal delayMs={80}>
            <h1 className="text-4xl leading-tight font-bold text-balance">{headline}</h1>
          </Reveal>
          <Reveal delayMs={160}>
            <p className="text-lg text-[var(--text-secondary)] text-balance">{subtitle}</p>
          </Reveal>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }, index) => (
              <Reveal
                key={text}
                as="li"
                delayMs={240 + index * 100}
                className="group flex items-start gap-3 text-[var(--text-secondary)] hover:translate-x-1"
              >
                <Icon className="mt-0.5 size-5 shrink-0 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110" />
                <span>{text}</span>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delayMs={600}>
          <span className="relative z-10 text-sm text-[var(--text-muted)]">
            Vantage &mdash; Yapay Zeka Destekli Proje Yönetimi
          </span>
        </Reveal>
      </div>

      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="page-fade-in mx-auto w-full max-w-sm">
          <Reveal>
            <Logo className="mb-10 lg:hidden" theme="light" />
          </Reveal>
          {children}
        </div>
      </div>
    </div>
  );
}
