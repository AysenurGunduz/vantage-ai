export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/logo2.png"
      alt="Vantage"
      className={`-ml-3 h-14 w-auto brightness-200 saturate-150 ${className}`}
    />
  );
}
