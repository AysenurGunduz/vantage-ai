import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import type { Task } from "@/types/api";

const priorityClass: Record<string, string> = {
  low: "bg-white/10 text-white/60",
  medium: "bg-indigo-500/20 text-indigo-300",
  high: "bg-[#ff6b5b]/20 text-[#ff6b5b]",
  urgent: "bg-[#ff6b5b]/30 text-[#ff6b5b]",
};

export function TaskCard({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab space-y-2 rounded-[3px] border border-white/10 bg-white/5 p-3 text-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <span>{task.title}</span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete(task.id);
          }}
          aria-label="Görevi sil"
          className="shrink-0 text-white/30 hover:text-[#ff6b5b]"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <span
        className={`inline-block rounded-[3px] px-2 py-0.5 text-xs ${priorityClass[task.priority] ?? priorityClass.medium}`}
      >
        {task.priority}
      </span>
    </div>
  );
}
