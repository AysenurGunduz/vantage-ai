import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types/api";
import { TaskCard } from "./TaskCard";

const statusDotClass: Record<TaskStatus, string> = {
  backlog: "bg-[var(--text-muted)]",
  todo: "bg-sky-400",
  in_progress: "bg-amber-400",
  review: "bg-purple-400",
  done: "bg-emerald-400",
};

export function KanbanColumn({
  id,
  label,
  tasks,
  onDelete,
  onOpenTask,
}: {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onOpenTask: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-0 flex-col gap-3 rounded-[8px] border p-3 transition-colors ${
        isOver
          ? "border-[var(--accent)]/50 bg-[var(--accent)]/5"
          : "border-[var(--surface-border)] bg-[var(--surface)]"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className={`size-1.5 rounded-full ${statusDotClass[id]}`} />
          {label}
        </h3>
        <span className="rounded-full bg-[var(--surface-hover)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-12 flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} onOpen={onOpenTask} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
