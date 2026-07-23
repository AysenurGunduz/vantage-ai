export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  estimated_hours: number | null;
  due_date: string | null;
  order_index: number;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
