import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
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
    navigate("/dashboard");
  }

  return (
    <AuthLayout
      headline="Ekibiniz nereye odaklanmalı, siz belirleyin."
      subtitle="Ekibiniz projelerini Kanban panosunda planlasın, görevleri atasın ve ilerlemeyi tek yerden takip etsin — yapay zeka görev üretir, gecikme riskini önceden haber verir."
    >
      <h2 className="text-2xl font-semibold tracking-tight">Tekrar hoş geldin</h2>
      <p className="mt-1 text-sm text-white/60">Devam etmek için hesabına giriş yap</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <p className="rounded-[3px] bg-[#ff6b5b]/10 px-3 py-2 text-sm text-[#ff6b5b]">{error}</p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/70">
            E-posta
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[3px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-white/70">
            Şifre
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[3px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full rounded-[3px] bg-[#ff6b5b] font-semibold text-[#0a0e1a] hover:bg-[#ff8577] active:bg-[#e85a4a]"
        >
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>

        <p className="text-center text-sm text-white/60">
          Hesabın yok mu?{" "}
          <Link to="/signup" className="font-medium text-[#ff6b5b] underline underline-offset-4">
            Kayıt ol
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
