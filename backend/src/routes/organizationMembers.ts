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
