import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-10 text-center ${className}`}>
      <span className="mb-1 flex size-11 items-center justify-center rounded-full bg-white/5">
        <Icon className="size-5 text-white/30" />
      </span>
      <p className="text-sm font-medium text-white/70">{title}</p>
      {description && <p className="max-w-xs text-xs text-white/40">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
