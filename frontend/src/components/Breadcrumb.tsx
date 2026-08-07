import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--text-secondary)]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link to={item.href} className="transition-colors hover:text-[var(--text-primary)]">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-[var(--text-primary)]" : ""}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="size-3.5 shrink-0 text-[var(--text-muted)]" />}
          </span>
        );
      })}
    </nav>
  );
}
