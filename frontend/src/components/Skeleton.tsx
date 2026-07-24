export function SidebarListSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-9 animate-pulse rounded-[3px] bg-white/5" style={{ animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

export function PanelSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-40 animate-pulse rounded-[3px] bg-white/5" />
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-64 shrink-0 space-y-2 rounded-[4px] border border-white/10 bg-white/[0.03] p-3">
            <div className="h-3 w-20 animate-pulse rounded-[3px] bg-white/10" />
            <div className="h-16 animate-pulse rounded-[3px] bg-white/5" style={{ animationDelay: `${i * 100}ms` }} />
            <div className="h-16 animate-pulse rounded-[3px] bg-white/5" style={{ animationDelay: `${i * 150}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
