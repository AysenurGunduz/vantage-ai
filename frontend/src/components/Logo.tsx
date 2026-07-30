export function Logo({ className = "" }: { className?: string }) {
  return <img src="/logo.png" alt="Vantage" className={`h-8 w-auto brightness-0 invert ${className}`} />;
}
