import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { slugify } from "../lib/slug.js";

export const organizationsRouter = Router();

organizationsRouter.use(requireAuth);

organizationsRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, slug, created_at)")
    .eq("user_id", req.user!.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data.map((row) => ({ ...row.organizations, role: row.role })));
});

organizationsRouter.post("/", async (req, res) => {
  const { name } = req.body as { name?: string };

  if (!name || !name.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const slug = `${slugify(name) || "org"}-${Math.random().toString(36).slice(2, 8)}`;

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: name.trim(), slug, owner_id: req.user!.id })
    .select()
    .single();

  if (orgError) {
    res.status(500).json({ error: orgError.message });
    return;
  }

  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({ organization_id: organization.id, user_id: req.user!.id, role: "owner" });

  if (memberError) {
    res.status(500).json({ error: memberError.message });
    return;
  }

  res.status(201).json(organization);
});
