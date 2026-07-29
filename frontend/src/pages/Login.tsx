import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, type Location } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await signIn(email, password);

    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    const from = (location.state as { from?: Location } | null)?.from;
    navigate(from ? `${from.pathname}${from.search}` : "/dashboard", { replace: true });
  }

  return (
    <AuthLayout
      headline="Ekibiniz nereye odaklanmalı, siz belirleyin."
      subtitle="Ekibiniz projelerini Kanban panosunda planlasın, görevleri atasın ve ilerlemeyi tek yerden takip etsin — yapay zeka görev üretir, gecikme riskini önceden haber verir."
    >
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">Tekrar hoş geldin</h2>
      </Reveal>
      <Reveal delayMs={80}>
        <p className="mt-1 text-sm text-white/60">Devam etmek için hesabına giriş yap</p>
      </Reveal>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-[6px] bg-[#ff6b5b]/10 px-3 py-2 text-sm text-[#ff6b5b]">{error}</p>
        )}

        <Reveal delayMs={160} className="space-y-1.5">
          <Label htmlFor="email" className="text-white/70">
            E-posta
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[6px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30"
          />
        </Reveal>

        <Reveal delayMs={240} className="space-y-1.5">
          <Label htmlFor="password" className="text-white/70">
            Şifre
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[6px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30"
          />
        </Reveal>

        <Reveal delayMs={320}>
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full rounded-[6px] bg-[#ff6b5b] font-semibold text-[#0d1b3a] transition-transform hover:scale-[1.02] hover:bg-[#ff8577] active:bg-[#e85a4a]"
          >
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </Reveal>

        <Reveal delayMs={400}>
          <p className="text-center text-sm text-white/60">
            Hesabın yok mu?{" "}
            <Link to="/signup" className="font-medium text-[#ff6b5b] underline underline-offset-4">
              Kayıt ol
            </Link>
          </p>
        </Reveal>
      </form>
    </AuthLayout>
  );
}
