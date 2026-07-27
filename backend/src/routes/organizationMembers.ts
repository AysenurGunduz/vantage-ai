import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const organizationMembersRouter = Router({ mergeParams: true });

organizationMembersRouter.use(requireAuth);

const VALID_ROLES = ["owner", "admin", "member"] as const;

async function getMembership(organizationId: string, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

organizationMembersRouter.get("/", async (req, res) => {
  const { orgId } = req.params as { orgId: string };

  const membership = await getMembership(orgId, req.user!.id);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select("user_id, role, joined_at")
    .eq("organization_id", orgId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

organizationMembersRouter.patch("/:userId", async (req, res) => {
  const { orgId, userId } = req.params as { orgId: string; userId: string };
  const { role } = req.body as { role?: string };

  if (!role || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    res.status(400).json({ error: "role must be one of: owner, admin, member" });
    return;
  }

  const membership = await getMembership(orgId, req.user!.id);
  if (!membership || membership.role !== "owner") {
    res.status(403).json({ error: "Only an owner can change member roles" });
    return;
  }

  const { data: updated, error } = await supabase
    .from("organization_members")
    .update({ role })
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(updated);
});

organizationMembersRouter.delete("/:userId", async (req, res) => {
  const { orgId, userId } = req.params as { orgId: string; userId: string };

  const membership = await getMembership(orgId, req.user!.id);
  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    res.status(403).json({ error: "Only an owner or admin can remove members" });
    return;
  }

  if (userId === req.user!.id) {
    res.status(400).json({ error: "You cannot remove yourself" });
    return;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("owner_id")
    .eq("id", orgId)
    .maybeSingle();

  if (organization?.owner_id === userId) {
    res.status(400).json({ error: "The organization owner cannot be removed" });
    return;
  }

  if (membership.role === "admin") {
    const targetMembership = await getMembership(orgId, userId);
    if (targetMembership?.role !== "member") {
      res.status(403).json({ error: "Admins can only remove members" });
      return;
    }
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
});
