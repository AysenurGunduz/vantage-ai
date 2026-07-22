import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await signUp(email, password);

    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    setSuccess(true);
  }

  return (
    <AuthLayout
      headline="Ekibinizle birlikte daha hızlı ilerleyin."
      subtitle="Görevleri yapay zeka ile otomatik bölün, riskleri erkenden görün, ilerlemeyi anlık takip edin."
    >
      {success ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">E-postanı kontrol et</h2>
          <p className="text-sm text-[#201e1d]/60">
            Hesabını onaylamak için gönderdiğimiz bağlantıya tıkla.
          </p>
          <Link to="/login" className="inline-block text-sm font-medium text-[#0088b0] underline underline-offset-4">
            Giriş sayfasına dön
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold tracking-tight">Hesabını oluştur</h2>
          <p className="mt-1 text-sm text-[#201e1d]/60">Vantage'ı kullanmaya hemen başla</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p className="rounded-[3px] bg-[#d6006c]/10 px-3 py-2 text-sm text-[#d6006c]">{error}</p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#201e1d]/70">
                E-posta
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-[3px] border-[#201e1d]/15 bg-[#eae9e9] focus-visible:border-[#0088b0] focus-visible:ring-[#0088b0]/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#201e1d]/70">
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-[3px] border-[#201e1d]/15 bg-[#eae9e9] focus-visible:border-[#0088b0] focus-visible:ring-[#0088b0]/30"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full rounded-[3px] bg-[#0088b0] font-semibold text-[#f3f2f2] hover:bg-[#1186ac] active:bg-[#006786]"
            >
              {submitting ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </Button>

            <p className="text-center text-sm text-[#201e1d]/60">
              Zaten hesabın var mı?{" "}
              <Link to="/login" className="font-medium text-[#0088b0] underline underline-offset-4">
                Giriş yap
              </Link>
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
