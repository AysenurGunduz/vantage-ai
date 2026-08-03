export function Logo({ className = "", theme = "dark" }: { className?: string; theme?: "dark" | "light" }) {
  return (
    <img
      src="/logo2.png"
      alt="Vantage"
      className={`-ml-3 h-14 w-auto ${theme === "dark" ? "brightness-200 saturate-150" : ""} ${className}`}
    />
  );
}
