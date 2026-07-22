import { useAuth } from "../lib/AuthContext";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-muted/40 to-background px-4">
      <div className="text-center">
        <img src="/logo.png" alt="Vantage" className="mx-auto mb-6 h-10" />
        <p className="text-muted-foreground">Giriş yapıldı: {user?.email}</p>
        <Button onClick={() => signOut()} className="mt-4">
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
