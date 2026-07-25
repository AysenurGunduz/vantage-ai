import { useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import type { Task, TaskPriority } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

const priorityPillClass: Record<TaskPriority, string> = {
  low: "bg-white/10 text-white/60",
  medium: "bg-indigo-500/20 text-indigo-300",
  high: "bg-[#ff6b5b]/20 text-[#ff6b5b]",
  urgent: "bg-[#ff6b5b]/30 text-[#ff6b5b]",
};

const fieldClass =
  "w-full rounded-[3px] border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus-visible:border-[#ff6b5b] focus-visible:ring-2 focus-visible:ring-[#ff6b5b]/30";

export function TaskDetailModal({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (updated: Task) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch<Task>(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          priority,
        }),
      });
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="dark-theme fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-[4px] border border-white/10 bg-[#0f2044] p-6 text-white shadow-2xl shadow-black/50"
      >
        <div className="flex items-start justify-between gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-semibold outline-none focus-visible:border-b focus-visible:border-[#ff6b5b]"
          />
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="shrink-0 text-white/40 transition-colors hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map((option) => (
            <button
              key={option}
              onClick={() => setPriority(option)}
              className={`rounded-[3px] px-2.5 py-1 text-xs transition-colors ${
                priority === option ? priorityPillClass[option] : "bg-white/5 text-white/40 hover:bg-white/10"
              } ${priority === option ? "ring-1 ring-inset ring-white/20" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Görev hakkında detay ekle..."
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50">Son tarih</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-[3px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30"
          />
        </div>

        {error && <p className="text-sm text-[#ff6b5b]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-[3px] border-white/20 bg-transparent text-white hover:bg-white/5"
          >
            Vazgeç
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-[3px] bg-[#ff6b5b] text-[#0d1b3a] hover:bg-[#ff8577]"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
