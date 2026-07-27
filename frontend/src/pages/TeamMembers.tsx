import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, Copy, Trash2, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { useAuth } from "../lib/AuthContext";
import type {
  Organization,
  OrganizationInvitation,
  OrganizationMember,
  OrganizationRole,
} from "@/types/api";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu";
}

const inputClass =
  "rounded-[3px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30";
const panelClass = "rounded-[4px] border border-white/10 bg-white/[0.03] p-5";
const selectClass =
  "rounded-[3px] border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none focus-visible:border-[#ff6b5b]";

const roleLabel: Record<OrganizationRole, string> = {
  owner: "Sahip",
  admin: "Yönetici",
  member: "Üye",
};

function initials(name: string | null, email: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamMembers() {
  const { orgId } = useParams<{ orgId: string }>();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganizationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const { user: currentUser } = useAuth();
  const myMembership = members.find((member) => member.user_id === currentUser?.id) ?? null;
  const canManage = myMembership?.role === "owner" || myMembership?.role === "admin";

  useEffect(() => {
    if (!orgId) return;

    Promise.all([
      apiFetch<Organization[]>("/api/organizations"),
      apiFetch<OrganizationMember[]>(`/api/organizations/${orgId}/members`),
    ])
      .then(([orgs, memberList]) => {
        setOrganization(orgs.find((org) => org.id === orgId) ?? null);
        setMembers(memberList);
      })
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => {
    if (!orgId || !canManage) return;
    apiFetch<OrganizationInvitation[]>(`/api/organizations/${orgId}/invitations`)
      .then(setInvitations)
      .catch(() => undefined);
  }, [orgId, canManage]);

  async function handleInvite(event: FormEvent) {
    event.preventDefault();
    if (!orgId) return;
    setError(null);
    setInviting(true);
    setInviteLink(null);
    try {
      const { token, ...invitation } = await apiFetch<OrganizationInvitation & { token: string }>(
        `/api/organizations/${orgId}/invitations`,
        { method: "POST", body: JSON.stringify({ email: inviteEmail, role: inviteRole }) },
      );
      setInvitations((prev) => [invitation, ...prev]);
      setInviteLink(`${window.location.origin}/invite/${token}`);
      setInviteEmail("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setInviting(false);
    }
  }

  async function handleRevoke(invitationId: string) {
    if (!orgId) return;
    setError(null);
    try {
      await apiFetch<void>(`/api/organizations/${orgId}/invitations/${invitationId}`, { method: "DELETE" });
      setInvitations((prev) => prev.filter((invitation) => invitation.id !== invitationId));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleRoleChange(userId: string, role: OrganizationRole) {
    if (!orgId) return;
    const previous = members;
    setMembers((prev) => prev.map((member) => (member.user_id === userId ? { ...member, role } : member)));
    setError(null);
    try {
      await apiFetch<OrganizationMember>(`/api/organizations/${orgId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
    } catch (err) {
      setMembers(previous);
      setError(errorMessage(err));
    }
  }

  async function handleRemove(userId: string) {
    if (!orgId) return;
    setError(null);
    try {
      await apiFetch<void>(`/api/organizations/${orgId}/members/${userId}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((member) => member.user_id !== userId));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="dark-theme animated-gradient min-h-screen text-white">
      <div className="page-fade-in mx-auto max-w-screen-2xl px-8 py-8">
        <div className="mb-8">
          <Logo />
          <Link
            to="/dashboard/workspace"
            className="mt-2 block text-sm text-white/50 transition-colors hover:text-[#ff6b5b]"
          >
            ← Çalışma alanına dön
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-white/50">
          <Building2 className="size-4" />
          <span>{organization?.name ?? "Organizasyon"}</span>
          <span>/</span>
          <span className="font-semibold text-white">Ekip Üyeleri</span>
        </div>

        {error && (
          <p className="mb-6 rounded-[3px] bg-[#ff6b5b]/10 px-3 py-2 text-sm text-[#ff6b5b]">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-white/50">Yükleniyor...</p>
        ) : (
          <div className="space-y-6">
            {canManage && (
              <section className="relative overflow-hidden rounded-[4px] border border-[#ff6b5b]/30 bg-[#ff6b5b]/[0.06] p-6">
                <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[#ff6b5b]/20 blur-3xl" />

                <div className="relative mb-4 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ff6b5b]/15">
                    <UserPlus className="size-5 text-[#ff6b5b]" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">Ekibine yeni birini davet et</h2>
                    <p className="text-sm text-white/60">E-posta ve rol seç, davet linkini paylaş.</p>
                  </div>
                </div>

                <form onSubmit={handleInvite} className="relative flex flex-wrap items-center gap-2.5">
                  <Input
                    type="email"
                    placeholder="yeni.uye@sirket.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className={`${inputClass} min-w-[240px] flex-1 border-white/20 bg-white/10`}
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                    className={`${selectClass} border-white/20 bg-white/10`}
                  >
                    <option value="member">Üye</option>
                    <option value="admin">Yönetici</option>
                  </select>
                  <Button
                    type="submit"
                    disabled={inviting}
                    size="lg"
                    className="rounded-[3px] bg-[#ff6b5b] font-semibold text-[#0d1b3a] shadow-lg shadow-[#ff6b5b]/20 hover:bg-[#ff8577] hover:shadow-xl hover:shadow-[#ff6b5b]/30"
                  >
                    <UserPlus className="size-4" />
                    {inviting ? "Gönderiliyor..." : "Davet Et"}
                  </Button>
                </form>

                {inviteLink && (
                  <div className="relative mt-4 flex items-center gap-2 rounded-[3px] border border-white/15 bg-[#0d1b3a]/60 px-3 py-2.5 text-sm">
                    <span className="truncate text-white/70">{inviteLink}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-[#ff6b5b] hover:text-[#ff8577]"
                    >
                      <Copy className="size-3.5" />
                      Kopyala
                    </button>
                  </div>
                )}
              </section>
            )}

            <section className={panelClass}>
              <h2 className="mb-4 text-sm font-semibold tracking-tight">Üyeler</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-white/40 uppercase">
                      <th className="pb-2 font-medium">Üye</th>
                      <th className="pb-2 font-medium">E-posta</th>
                      <th className="pb-2 font-medium">Rol</th>
                      <th className="pb-2 font-medium">Durum</th>
                      {canManage && <th className="pb-2 font-medium" />}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.user_id} className="border-b border-white/5">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                              {initials(member.full_name, member.email)}
                            </span>
                            {member.full_name ?? "İsimsiz kullanıcı"}
                          </div>
                        </td>
                        <td className="py-3 text-white/70">{member.email ?? "—"}</td>
                        <td className="py-3">
                          {canManage && myMembership?.role === "owner" && member.user_id !== currentUser?.id ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.user_id, e.target.value as OrganizationRole)}
                              className={selectClass}
                            >
                              <option value="owner">Sahip</option>
                              <option value="admin">Yönetici</option>
                              <option value="member">Üye</option>
                            </select>
                          ) : (
                            <span className="text-white/70">{roleLabel[member.role] ?? member.role}</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                            Aktif
                          </span>
                        </td>
                        {canManage && (
                          <td className="py-3 text-right">
                            {member.user_id !== currentUser?.id && (
                              <button
                                onClick={() => handleRemove(member.user_id)}
                                aria-label="Üyeyi çıkar"
                                className="text-white/30 transition-colors hover:text-[#ff6b5b]"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {canManage && invitations.length > 0 && (
              <section className={panelClass}>
                <h2 className="mb-4 text-sm font-semibold tracking-tight">Bekleyen Davetler</h2>
                <ul className="space-y-2">
                  {invitations
                    .filter((invitation) => invitation.status === "pending")
                    .map((invitation) => (
                      <li
                        key={invitation.id}
                        className="flex items-center justify-between gap-3 rounded-[3px] border border-white/10 bg-white/5 px-3 py-2 text-sm"
                      >
                        <span>{invitation.email}</span>
                        <span className="text-xs text-white/40">{roleLabel[invitation.role]}</span>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/60">
                          Davet gönderildi
                        </span>
                        <button
                          onClick={() => handleRevoke(invitation.id)}
                          className="text-white/30 transition-colors hover:text-[#ff6b5b]"
                          aria-label="Daveti iptal et"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
