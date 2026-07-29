import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/apiClient";
import type { DashboardStats } from "../types/api";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { PanelSkeleton } from "@/components/Skeleton";
import { Reveal } from "@/components/Reveal";
import { NetworkBackground } from "@/components/NetworkBackground";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu";
}

const panelClass = "rounded-[8px] border border-[var(--surface-border)] bg-[var(--surface)] p-5";

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "Devam Ediyor",
  review: "İncelemede",
  done: "Tamamlandı",
};

// Categorical palette, validated for adjacent-pair CVD separation against this
// app's dark surface (see dataviz skill) — order is load-bearing, don't shuffle.
const STATUS_COLORS: Record<string, string> = {
  backlog: "#3987e5",
  todo: "#d95926",
  in_progress: "#199e70",
  review: "#c98500",
  done: "#d55181",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  urgent: "Acil",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#94a3b8",
  medium: "#818cf8",
  high: "#ff6b5b",
  urgent: "#ff3b30",
};

const CRITICAL_COLOR = "#d03b3b";

const chartTickStyle = { fill: "var(--text-muted)", fontSize: 12 };
const tooltipContentStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--surface-border)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontSize: 13,
};

function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className={panelClass}>
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-semibold" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  );
}

export default function Overview() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DashboardStats>("/api/dashboard/stats")
      .then(setStats)
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const statusData = stats
    ? Object.entries(stats.byStatus).map(([status, value]) => ({
        status,
        label: STATUS_LABELS[status] ?? status,
        value,
      }))
    : [];

  const priorityData = stats
    ? Object.entries(stats.byPriority).map(([priority, value]) => ({
        priority,
        label: PRIORITY_LABELS[priority] ?? priority,
        value,
      }))
    : [];

  return (
    <div className="dark-theme animated-gradient relative min-h-screen overflow-hidden text-white">
      <NetworkBackground className="opacity-40" />
      <div className="floating-blob pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#ff6b5b]/8 blur-3xl" />
      <div className="floating-blob-reverse pointer-events-none absolute top-1/2 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="page-fade-in relative z-10 mx-auto max-w-screen-2xl px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Logo />
            <Link to="/dashboard" className="mt-2 block text-sm text-white/50 transition-colors hover:text-[#ff6b5b]">
              ← Panele dön
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span
              title={user?.email}
              className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white"
            >
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </span>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="rounded-[6px] border-white/20 bg-transparent text-white transition-colors hover:bg-white/5 hover:text-white"
            >
              Çıkış Yap
            </Button>
          </div>
        </div>

        <h1 className="mb-6 text-2xl font-semibold">Genel Bakış</h1>

        {error && <p className="mb-6 rounded-[6px] bg-[#ff6b5b]/10 px-3 py-2 text-sm text-[#ff6b5b]">{error}</p>}

        {loading ? (
          <PanelSkeleton />
        ) : (
          stats && (
            <div className="space-y-6">
              <Reveal className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile icon={<ListTodo className="size-4" />} label="Toplam Görev" value={stats.totalTasks} />
                <StatTile
                  icon={<Clock3 className="size-4" />}
                  label="Devam Eden"
                  value={stats.byStatus.in_progress}
                />
                <StatTile
                  icon={<CheckCircle2 className="size-4" />}
                  label="Tamamlanan"
                  value={stats.byStatus.done}
                />
                <StatTile
                  icon={<AlertTriangle className="size-4" style={{ color: CRITICAL_COLOR }} />}
                  label="Geciken"
                  value={stats.overdueTasks.length}
                  accent={stats.overdueTasks.length > 0 ? CRITICAL_COLOR : undefined}
                />
              </Reveal>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Reveal delayMs={80} as="section" className={panelClass}>
                  <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">Duruma Göre Dağılım</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={statusData} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--surface-border)" />
                      <XAxis dataKey="label" tick={chartTickStyle} axisLine={{ stroke: "var(--surface-border)" }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={chartTickStyle} axisLine={false} tickLine={false} width={28} />
                      <Tooltip cursor={{ fill: "var(--surface-hover)" }} contentStyle={tooltipContentStyle} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {statusData.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Reveal>

                <Reveal delayMs={140} as="section" className={panelClass}>
                  <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">Önceliğe Göre Dağılım</h2>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={priorityData} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--surface-border)" />
                      <XAxis dataKey="label" tick={chartTickStyle} axisLine={{ stroke: "var(--surface-border)" }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={chartTickStyle} axisLine={false} tickLine={false} width={28} />
                      <Tooltip cursor={{ fill: "var(--surface-hover)" }} contentStyle={tooltipContentStyle} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        {priorityData.map((entry) => (
                          <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                        ))}
                        <LabelList dataKey="value" position="top" style={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Reveal>
              </div>

              <Reveal delayMs={200} as="section" className={panelClass}>
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
                  <AlertTriangle className="size-4" style={{ color: CRITICAL_COLOR }} />
                  Geciken Görevler
                </h2>
                {stats.overdueTasks.length === 0 ? (
                  <p className="text-sm text-white/40">Gecikmiş görev yok, harika gidiyorsun.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.overdueTasks.map((task) => (
                      <li
                        key={task.id}
                        className="flex items-center justify-between gap-3 rounded-[6px] border-l-2 px-3 py-2 text-sm"
                        style={{ borderColor: CRITICAL_COLOR, backgroundColor: "rgba(208, 59, 59, 0.08)" }}
                      >
                        <span className="truncate">{task.title}</span>
                        <span className="flex shrink-0 items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>{PRIORITY_LABELS[task.priority]}</span>
                          <span style={{ color: CRITICAL_COLOR }}>{formatDueDate(task.due_date)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            </div>
          )
        )}
      </div>
    </div>
  );
}
