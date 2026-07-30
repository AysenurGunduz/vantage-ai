import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Trash2 } from "lucide-react";
import type { Task } from "@/types/api";

const priorityClass: Record<string, string> = {
  low: "bg-[var(--priority-low)]/15 text-[var(--priority-low)]",
  medium: "bg-[var(--priority-medium)]/15 text-[var(--priority-medium)]",
  high: "bg-[var(--priority-high)]/15 text-[var(--priority-high)]",
  urgent: "bg-[var(--priority-urgent)]/20 text-[var(--priority-urgent)]",
};

function formatDueDate(dueDate: string) {
  return new Date(dueDate).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function TaskCard({
  task,
  onDelete,
  onOpen,
}: {
  task: Task;
  onDelete: (id: string) => void;
  onOpen: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.due_date !== null && task.status !== "done" && task.due_date < new Date().toISOString().slice(0, 10);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className={`group relative cursor-grab space-y-2 rounded-[6px] border border-[var(--surface-border)] bg-[var(--surface)] p-3 text-sm transition-all hover:border-[var(--surface-border-hover)] hover:bg-[var(--surface-hover)] hover:shadow-lg hover:shadow-black/20 active:cursor-grabbing ${
        isDragging ? "scale-[1.03] opacity-90 shadow-xl shadow-black/40" : ""
      }`}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          onDelete(task.id);
        }}
        aria-label="Görevi sil"
        className="absolute top-2 right-2 rounded-[4px] bg-[var(--surface)] p-1 text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--accent)]"
      >
        <Trash2 className="size-3.5" />
      </button>

      <span className="block pr-6">{task.title}</span>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded-[6px] px-2 py-0.5 text-xs ${priorityClass[task.priority] ?? priorityClass.medium}`}
        >
          {task.priority}
        </span>
        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${isOverdue ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}
          >
            <CalendarDays className="size-3" />
            {formatDueDate(task.due_date)}
          </span>
        )}
      </div>
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
