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
    navigate("/");
  }

  return (
    <AuthLayout
      headline="Projelerini tek bir yerden yönet"
      subtitle="Ekibinin işlerini planla, önceliklendir ve yapay zeka desteğiyle bir adım önde kal."
    >
      <h2 className="text-2xl font-bold tracking-tight">Tekrar hoş geldin</h2>
      <p className="mt-1 text-sm text-muted-foreground">Devam etmek için hesabına giriş yap</p>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Hesabın yok mu?{" "}
          <Link to="/signup" className="font-medium text-foreground underline underline-offset-4">
            Kayıt ol
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
