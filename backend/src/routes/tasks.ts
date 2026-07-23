import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const projectTasksRouter = Router({ mergeParams: true });
export const taskRouter = Router();

projectTasksRouter.use(requireAuth);
taskRouter.use(requireAuth);

async function getProjectMembership(projectId: string, userId: string) {
  const { data } = await supabase
    .from("project_members")
    .select("role_in_project")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

projectTasksRouter.get("/", async (req, res) => {
  const { projectId } = req.params as { projectId: string };

  const membership = await getProjectMembership(projectId, req.user!.id);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this project" });
    return;
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

projectTasksRouter.post("/", async (req, res) => {
  const { projectId } = req.params as { projectId: string };
  const { title, description, priority, due_date, assignee_id } = req.body as {
    title?: string;
    description?: string;
    priority?: string;
    due_date?: string;
    assignee_id?: string;
  };

  if (!title || !title.trim()) {
    res.status(400).json({ error: "title is required" });
    return;
  }

  const membership = await getProjectMembership(projectId, req.user!.id);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this project" });
    return;
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority ?? "medium",
      due_date: due_date ?? null,
      assignee_id: assignee_id ?? null,
      created_by: req.user!.id,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(task);
});

async function getTaskWithMembership(taskId: string, userId: string) {
  const { data: task } = await supabase.from("tasks").select("*").eq("id", taskId).maybeSingle();

  if (!task) {
    return { task: null, membership: null };
  }

  const membership = await getProjectMembership(task.project_id, userId);
  return { task, membership };
}

taskRouter.get("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { task, membership } = await getTaskWithMembership(taskId, req.user!.id);

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (!membership) {
    res.status(403).json({ error: "Not a member of this project" });
    return;
  }

  res.json(task);
});

const UPDATABLE_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "assignee_id",
  "estimated_hours",
  "due_date",
  "order_index",
] as const;

taskRouter.patch("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { task, membership } = await getTaskWithMembership(taskId, req.user!.id);

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (!membership) {
    res.status(403).json({ error: "Not a member of this project" });
    return;
  }

  const updates: Record<string, unknown> = {};
  for (const field of UPDATABLE_FIELDS) {
    if (field in req.body) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No updatable fields provided" });
    return;
  }
  updates.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(updated);
});

taskRouter.delete("/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { task, membership } = await getTaskWithMembership(taskId, req.user!.id);

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (!membership) {
    res.status(403).json({ error: "Not a member of this project" });
    return;
  }

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(204).send();
});
