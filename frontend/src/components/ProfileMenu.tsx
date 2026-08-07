import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  const { theme: activeTheme, toggleTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white outline-none transition-colors hover:bg-[var(--accent-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50"
        title={email ?? undefined}
      >
        {email?.[0]?.toUpperCase() ?? "?"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className={`min-w-52 ${theme === "light" ? "light-theme" : ""}`}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate px-2 py-1.5 text-xs font-normal text-[var(--text-secondary)]">
            {email ?? "Hesabım"}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={toggleTheme} className="px-2 py-1.5 text-[13px]">
          {activeTheme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          {activeTheme === "light" ? "Koyu Tema" : "Açık Tema"}
        </DropdownMenuItem>
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
