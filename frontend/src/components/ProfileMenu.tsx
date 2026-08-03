import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProfileMenu({
  email,
  onSignOut,
  theme = "dark",
}: {
  email?: string | null;
  onSignOut: () => void;
  theme?: "dark" | "light";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white outline-none transition-colors hover:bg-[var(--accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
        title={email ?? undefined}
      >
        {email?.[0]?.toUpperCase() ?? "?"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className={`min-w-52 ${theme === "light" ? "light-theme" : ""}`}>
        <DropdownMenuLabel className="truncate px-2 py-1.5 text-xs font-normal text-[var(--text-secondary)]">
          {email ?? "Hesabım"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={onSignOut}
          className="px-2 py-1.5 text-[13px] data-[variant=destructive]:text-[#ff6b5b] data-[variant=destructive]:focus:bg-[#ff6b5b]/10 data-[variant=destructive]:focus:text-[#ff6b5b]"
        >
          <LogOut className="size-4" />
          Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
