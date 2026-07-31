import { TrendingUp } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <TrendingUp className="size-6 shrink-0 text-[#ff6b5b]" strokeWidth={2.75} />
      <span className="text-xl font-bold tracking-tight text-white">Vantage</span>
    </span>
  );
}
