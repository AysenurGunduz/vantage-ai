export function SidebarListSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-9 animate-pulse rounded-[6px] bg-[var(--surface-hover)]"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-40 animate-pulse rounded-[6px] bg-[var(--surface-hover)]" />
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-64 shrink-0 space-y-2 rounded-[8px] border border-[var(--surface-border)] bg-[var(--surface)] p-3"
          >
            <div className="h-3 w-20 animate-pulse rounded-[6px] bg-[var(--surface-hover)]" />
            <div
              className="h-16 animate-pulse rounded-[6px] bg-[var(--surface-hover)]"
              style={{ animationDelay: `${i * 100}ms` }}
            />
            <div
              className="h-16 animate-pulse rounded-[6px] bg-[var(--surface-hover)]"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
