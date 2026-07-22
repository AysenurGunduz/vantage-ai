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
      headline="Ekibinle birlikte daha hızlı ilerle"
      subtitle="Görevleri yapay zeka ile otomatik böl, riskleri erkenden gör, ilerlemeyi anlık takip et."
    >
      {success ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">E-postanı kontrol et</h2>
          <p className="text-sm text-muted-foreground">
            Hesabını onaylamak için gönderdiğimiz bağlantıya tıkla.
          </p>
          <Link to="/login" className="inline-block text-sm font-medium underline underline-offset-4">
            Giriş sayfasına dön
          </Link>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold tracking-tight">Hesabını oluştur</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vantage'ı kullanmaya hemen başla</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? "Kayıt olunuyor..." : "Kayıt Ol"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Zaten hesabın var mı?{" "}
              <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
                Giriş yap
              </Link>
            </p>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
