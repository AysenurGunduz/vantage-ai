import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import type { Task, TaskPriority } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

const priorityPillClass: Record<TaskPriority, string> = {
  low: "bg-[var(--priority-low)]/15 text-[var(--priority-low)]",
  medium: "bg-[var(--priority-medium)]/15 text-[var(--priority-medium)]",
  high: "bg-[var(--priority-high)]/15 text-[var(--priority-high)]",
  urgent: "bg-[var(--priority-urgent)]/20 text-[var(--priority-urgent)]",
};

const fieldClass =
  "w-full rounded-[6px] border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus-visible:border-[#ff6b5b] focus-visible:ring-2 focus-visible:ring-[#ff6b5b]/30";

interface ActivityEntry {
  id: string;
  action_type: string;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "Devam Ediyor",
  review: "İncelemede",
  done: "Tamamlandı",
};

function formatActivityTime(createdAt: string) {
  return new Date(createdAt).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function describeActivity(entry: ActivityEntry): string {
  switch (entry.action_type) {
    case "created":
      return "oluşturuldu";
    case "status":
      return `durum: ${STATUS_LABELS[entry.from_value ?? ""] ?? entry.from_value} → ${STATUS_LABELS[entry.to_value ?? ""] ?? entry.to_value}`;
    case "priority":
      return `öncelik: ${entry.from_value} → ${entry.to_value}`;
    case "due_date":
      return entry.to_value
        ? `son tarih ${new Date(entry.to_value).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} olarak ayarlandı`
        : "son tarih kaldırıldı";
    case "tags":
      return "etiketler güncellendi";
    case "assignee_id":
      return "atanan kişi değişti";
    default:
      return entry.action_type;
  }
}

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
  const [tags, setTags] = useState<string[]>(task.tags);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    apiFetch<ActivityEntry[]>(`/api/tasks/${task.id}/activity`)
      .then(setActivity)
      .catch(() => {})
      .finally(() => setActivityLoading(false));
  }, [task.id]);

  function addTag() {
    const value = tagInput.trim().toLowerCase();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

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
          tags,
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
        className="w-full max-w-md space-y-4 rounded-[8px] border border-[var(--surface-border)] bg-[var(--surface)] p-6 text-white shadow-2xl shadow-black/50"
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
              className={`rounded-[6px] px-2.5 py-1 text-xs transition-colors ${
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
          <label className="text-xs font-medium text-white/50">Etiketler</label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  aria-label={`${tag} etiketini kaldır`}
                  className="text-indigo-300/60 hover:text-indigo-200"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Etiket yaz, Enter'a bas"
            className="rounded-[6px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50">Son tarih</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-[6px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50">Aktivite Geçmişi</label>
          {activityLoading ? (
            <p className="text-xs text-white/30">Yükleniyor...</p>
          ) : activity.length === 0 ? (
            <p className="text-xs text-white/30">Henüz bir aktivite yok.</p>
          ) : (
            <ul className="max-h-28 space-y-1 overflow-y-auto pr-1 text-xs text-white/60">
              {activity.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 truncate">{describeActivity(entry)}</span>
                  <span className="shrink-0 text-white/30">{formatActivityTime(entry.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-[#ff6b5b]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-[6px] border-white/20 bg-transparent text-white hover:bg-white/5 hover:text-white"
          >
            Vazgeç
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-[6px] bg-[#ff6b5b] text-[#0d1b3a] hover:bg-[#ff8577]"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
