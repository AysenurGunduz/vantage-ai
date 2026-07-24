import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types/api";
import { TaskCard } from "./TaskCard";

const statusDotClass: Record<TaskStatus, string> = {
  backlog: "bg-white/30",
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
      className={`flex w-64 shrink-0 flex-col gap-3 rounded-[4px] border p-3 transition-colors ${
        isOver ? "border-[#ff6b5b]/50 bg-[#ff6b5b]/5" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between px-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className={`size-1.5 rounded-full ${statusDotClass[id]}`} />
          {label}
        </h3>
        <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-xs text-white/40">{tasks.length}</span>
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
