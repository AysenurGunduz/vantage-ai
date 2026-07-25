import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, Trash2 } from "lucide-react";
import type { Task } from "@/types/api";

const priorityClass: Record<string, string> = {
  low: "bg-white/10 text-white/60",
  medium: "bg-indigo-500/20 text-indigo-300",
  high: "bg-[#ff6b5b]/20 text-[#ff6b5b]",
  urgent: "bg-[#ff6b5b]/30 text-[#ff6b5b]",
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
    task.due_date !== null && task.status !== "done" && new Date(task.due_date) < new Date(new Date().toDateString());

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className={`cursor-grab space-y-2 rounded-[3px] border border-white/10 bg-white/5 p-3 text-sm transition-all hover:border-white/20 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-black/20 active:cursor-grabbing ${
        isDragging ? "scale-[1.03] opacity-90 shadow-xl shadow-black/40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span>{task.title}</span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task.id);
          }}
          aria-label="Görevi sil"
          className="shrink-0 text-white/30 transition-colors hover:text-[#ff6b5b]"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded-[3px] px-2 py-0.5 text-xs ${priorityClass[task.priority] ?? priorityClass.medium}`}
        >
          {task.priority}
        </span>
        {task.due_date && (
          <span
            className={`inline-flex items-center gap-1 text-xs ${isOverdue ? "text-[#ff6b5b]" : "text-white/40"}`}
          >
            <CalendarDays className="size-3" />
            {formatDueDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
