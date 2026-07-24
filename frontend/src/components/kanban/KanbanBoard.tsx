import { DndContext, PointerSensor, closestCorners, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types/api";
import { KanbanColumn } from "./KanbanColumn";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "Todo" },
  { id: "in_progress", label: "Devam Ediyor" },
  { id: "review", label: "İncelemede" },
  { id: "done", label: "Tamamlandı" },
];

export function KanbanBoard({
  tasks,
  onStatusChange,
  onDelete,
}: {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) return;

    const overIsColumn = COLUMNS.some((column) => column.id === over.id);
    const newStatus: TaskStatus | undefined = overIsColumn
      ? (over.id as TaskStatus)
      : tasks.find((task) => task.id === over.id)?.status;

    if (newStatus && newStatus !== activeTask.status) {
      onStatusChange(activeTask.id, newStatus);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            tasks={tasks.filter((task) => task.status === column.id)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
