import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const projectsRouter = Router({ mergeParams: true });

projectsRouter.use(requireAuth);

async function getMembership(organizationId: string, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

projectsRouter.get("/", async (req, res) => {
  const { orgId } = req.params as { orgId: string };

  const membership = await getMembership(orgId, req.user!.id);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

projectsRouter.post("/", async (req, res) => {
  const { orgId } = req.params as { orgId: string };
  const { name, description } = req.body as { name?: string; description?: string };

  if (!name || !name.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const membership = await getMembership(orgId, req.user!.id);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this organization" });
    return;
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      organization_id: orgId,
      name: name.trim(),
      description: description?.trim() || null,
      created_by: req.user!.id,
    })
    .select()
    .single();

  if (projectError) {
    res.status(500).json({ error: projectError.message });
    return;
  }

  const { error: memberError } = await supabase
    .from("project_members")
    .insert({ project_id: project.id, user_id: req.user!.id, role_in_project: membership.role });

  if (memberError) {
    res.status(500).json({ error: memberError.message });
    return;
  }

  res.status(201).json(project);
});
