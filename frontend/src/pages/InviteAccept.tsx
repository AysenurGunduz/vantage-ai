import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/apiClient";
import { useAuth } from "../lib/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

interface InvitationDetails {
  organization_id: string;
  organization_name: string | null;
  email: string;
  role: string;
}

const roleLabel: Record<string, string> = {
  owner: "sahip",
  admin: "yönetici",
  member: "üye",
};

function describeError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 404) return "Bu davet linki geçersiz.";
    if (err.status === 410) return "Bu davetin süresi dolmuş ya da zaten kullanılmış.";
    if (err.status === 403) return "Bu davet farklı bir e-posta adresi için oluşturulmuş.";
    if (err.status === 409) return "Zaten bu organizasyonun üyesisin.";
  }
  return err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";
}

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<InvitationDetails>(`/api/invitations/${token}`)
      .then(setInvitation)
      .catch((err: unknown) => setError(describeError(err)))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    setError(null);
    try {
      await apiFetch(`/api/invitations/${token}/accept`, { method: "POST" });
      navigate("/dashboard/workspace");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="dark-theme animated-gradient flex min-h-screen items-center justify-center px-6 text-center text-white">
      <div className="page-fade-in w-full max-w-md space-y-6 rounded-[8px] border border-white/10 bg-white/[0.04] p-8">
        <Logo />

        {loading && <p className="text-sm text-white/60">Davet kontrol ediliyor...</p>}

        {!loading && error && (
          <div className="space-y-4">
            <p className="rounded-[6px] bg-[#ff6b5b]/10 px-3 py-2 text-sm text-[#ff6b5b]">{error}</p>
            {user && (
              <p className="text-xs text-white/40">
                Şu an {user.email} ile giriş yapmış durumdasın.{" "}
                <button onClick={() => signOut()} className="text-[#ff6b5b] underline underline-offset-4">
                  Çıkış yap
                </button>
              </p>
            )}
            <Link to="/dashboard" className="inline-block text-sm text-white/60 hover:text-white">
              Panele dön
            </Link>
          </div>
        )}

        {!loading && !error && invitation && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
              <Building2 className="size-8 text-[#ff6b5b]" />
              <p className="text-lg font-semibold">{invitation.organization_name ?? "Bir organizasyon"}</p>
              <p className="text-sm text-white/60">
                seni <span className="text-white">{roleLabel[invitation.role] ?? invitation.role}</span> rolüyle davet
                etti.
              </p>
            </div>
            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full rounded-[6px] bg-[#ff6b5b] font-semibold text-[#0d1b3a] hover:bg-[#ff8577]"
            >
              {accepting ? "Katılıyorsun..." : "Daveti kabul et"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
