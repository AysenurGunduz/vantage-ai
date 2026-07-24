import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, TaskStatus } from "@/types/api";
import { TaskCard } from "./TaskCard";

export function KanbanColumn({
  id,
  label,
  tasks,
  onDelete,
}: {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  onDelete: (id: string) => void;
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
        <h3 className="text-sm font-semibold">{label}</h3>
        <span className="text-xs text-white/40">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="flex min-h-12 flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
