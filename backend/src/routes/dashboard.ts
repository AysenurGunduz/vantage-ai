import { Router } from "express";
import { supabase } from "../lib/supabaseClient.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

const STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

dashboardRouter.get("/stats", async (req, res) => {
  const { data: memberships, error: membershipError } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", req.user!.id);

  if (membershipError) {
    res.status(500).json({ error: membershipError.message });
    return;
  }

  const projectIds = memberships.map((row) => row.project_id);

  if (projectIds.length === 0) {
    res.json({
      totalTasks: 0,
      byStatus: Object.fromEntries(STATUSES.map((status) => [status, 0])),
      byPriority: Object.fromEntries(PRIORITIES.map((priority) => [priority, 0])),
      overdueTasks: [],
    });
    return;
  }

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, project_id")
    .in("project_id", projectIds);

  if (tasksError) {
    res.status(500).json({ error: tasksError.message });
    return;
  }

  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<
    (typeof STATUSES)[number],
    number
  >;
  const byPriority = Object.fromEntries(PRIORITIES.map((priority) => [priority, 0])) as Record<
    (typeof PRIORITIES)[number],
    number
  >;

  const today = new Date().toISOString().slice(0, 10);
  const overdueTasks = [];

  for (const task of tasks) {
    byStatus[task.status as (typeof STATUSES)[number]] += 1;
    byPriority[task.priority as (typeof PRIORITIES)[number]] += 1;

    if (task.due_date && task.due_date < today && task.status !== "done") {
      overdueTasks.push(task);
    }
  }

  overdueTasks.sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1));

  res.json({
    totalTasks: tasks.length,
    byStatus,
    byPriority,
    overdueTasks,
  });
});
