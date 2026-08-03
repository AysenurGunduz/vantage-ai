import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { interactiveAI } from "../ai/index.js";
import { logActivity } from "./tasks.js";

export const projectAITaskSplitsRouter = Router({ mergeParams: true });
export const aiTaskSplitRouter = Router();

projectAITaskSplitsRouter.use(requireAuth);
aiTaskSplitRouter.use(requireAuth);

interface SuggestedSubtask {
  title: string;
  estimated_hours?: number;
}

interface SuggestedTasksPayload {
  subtasks: SuggestedSubtask[];
}

function isValidSuggestion(value: unknown): value is SuggestedTasksPayload {
  if (typeof value !== "object" || value === null) return false;
  const subtasks = (value as { subtasks?: unknown }).subtasks;
  if (!Array.isArray(subtasks) || subtasks.length === 0) return false;
  return subtasks.every((item) => {
    if (typeof item !== "object" || item === null) return false;
    const { title, estimated_hours } = item as SuggestedSubtask;
    if (typeof title !== "string" || !title.trim()) return false;
    return estimated_hours === undefined || typeof estimated_hours === "number";
  });
}

function buildTaskSplitPrompt(description: string): string {
  return `Sen bir proje yönetimi asistanısın. Aşağıdaki görev/proje açıklamasını mantıklı, uygulanabilir alt görevlere böl. Her alt görev kısa ve net bir başlık olsun, mümkünse tahmini süreyi saat cinsinden ekle.

Açıklama: "${description}"

SADECE şu JSON şemasına uyan bir çıktı ver, başka hiçbir açıklama ya da metin ekleme:
{"subtasks": [{"title": "string", "estimated_hours": number}]}`;
}

async function getProjectMembership(projectId: string, userId: string) {
  const { data } = await supabase
    .from("project_members")
    .select("role_in_project")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

projectAITaskSplitsRouter.post("/", async (req, res) => {
  const { projectId } = req.params as { projectId: string };
  const { description } = req.body as { description?: string };

  if (!description || !description.trim()) {
    res.status(400).json({ error: "description is required" });
    return;
  }

  const membership = await getProjectMembership(projectId, req.user!.id);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this project" });
    return;
  }

  let suggestion: SuggestedTasksPayload;
  try {
    const raw = await interactiveAI.generateJSON<unknown>(buildTaskSplitPrompt(description.trim()));
    if (!isValidSuggestion(raw)) {
      throw new Error("Model response did not match the expected schema");
    }
    suggestion = raw;
  } catch {
    res.status(502).json({ error: "AI görev önerisi üretilemedi, tekrar dener misin?" });
    return;
  }

  const { data: record, error } = await supabase
    .from("ai_task_suggestions")
    .insert({
      project_id: projectId,
      source_description: description.trim(),
      suggested_tasks: suggestion,
      status: "pending",
      created_by: req.user!.id,
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(record);
});

aiTaskSplitRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, suggested_tasks: editedTasks } = req.body as {
    status?: "accepted" | "rejected";
    suggested_tasks?: unknown;
  };

  if (status !== "accepted" && status !== "rejected") {
    res.status(400).json({ error: "status must be 'accepted' or 'rejected'" });
    return;
  }

  const { data: suggestionRow } = await supabase
    .from("ai_task_suggestions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!suggestionRow) {
    res.status(404).json({ error: "Suggestion not found" });
    return;
  }

  const membership = await getProjectMembership(suggestionRow.project_id, req.user!.id);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this project" });
    return;
  }

  if (suggestionRow.status !== "pending") {
    res.status(400).json({ error: "This suggestion was already resolved" });
    return;
  }

  let finalTasks = suggestionRow.suggested_tasks as SuggestedTasksPayload;
  if (status === "accepted" && editedTasks !== undefined) {
    if (!isValidSuggestion(editedTasks)) {
      res.status(400).json({ error: "suggested_tasks does not match the expected schema" });
      return;
    }
    finalTasks = editedTasks;
  }

  if (status === "accepted") {
    const rowsToInsert = finalTasks.subtasks.map((subtask) => ({
      project_id: suggestionRow.project_id,
      title: subtask.title.trim(),
      estimated_hours: subtask.estimated_hours ?? null,
      ai_generated: true,
      created_by: req.user!.id,
    }));

    const { data: createdTasks, error: insertError } = await supabase
      .from("tasks")
      .insert(rowsToInsert)
      .select();

    if (insertError) {
      res.status(500).json({ error: insertError.message });
      return;
    }

    for (const task of createdTasks ?? []) {
      await logActivity(task.id, req.user!.id, "created", null, task.title);
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("ai_task_suggestions")
    .update({ status, suggested_tasks: finalTasks })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  res.json(updated);
});
