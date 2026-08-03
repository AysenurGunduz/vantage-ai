import { useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import type { AITaskSuggestion, SuggestedSubtask } from "@/types/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const fieldClass =
  "w-full rounded-[6px] border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30";

export function AITaskSplitDialog({
  projectId,
  open,
  theme = "dark",
  onOpenChange,
}: {
  projectId: string;
  open: boolean;
  theme?: "dark" | "light";
  onOpenChange: (open: boolean) => void;
}) {
  const [description, setDescription] = useState("");
  const [suggestion, setSuggestion] = useState<AITaskSuggestion | null>(null);
  const [subtasks, setSubtasks] = useState<SuggestedSubtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDescription("");
    setSuggestion(null);
    setSubtasks([]);
    setError(null);
  }

  async function handleSuggest() {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<AITaskSuggestion>(`/api/projects/${projectId}/ai/task-splits`, {
        method: "POST",
        body: JSON.stringify({ description: description.trim() }),
      });
      setSuggestion(result);
      setSubtasks(result.suggested_tasks.subtasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Öneri alınamadı, tekrar dener misin?");
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(status: "accepted" | "rejected") {
    if (!suggestion) return;
    setResolving(true);
    setError(null);
    try {
      await apiFetch(`/api/ai/task-splits/${suggestion.id}`, {
        method: "PATCH",
        body: JSON.stringify(status === "accepted" ? { status, suggested_tasks: { subtasks } } : { status }),
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem tamamlanamadı");
    } finally {
      setResolving(false);
    }
  }

  function updateSubtask(index: number, patch: Partial<SuggestedSubtask>) {
    setSubtasks((prev) => prev.map((task, i) => (i === index ? { ...task, ...patch } : task)));
  }

  function removeSubtask(index: number) {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  }

  function addSubtask() {
    setSubtasks((prev) => [...prev, { title: "" }]);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className={`sm:max-w-lg ${theme === "light" ? "light-theme" : ""}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-[#ff6b5b]" />
            AI ile görev öner
          </DialogTitle>
          <DialogDescription>
            {suggestion
              ? "Öneriyi incele, gerekirse düzenle, sonra onayla ya da reddet."
              : "Görevi kısaca anlat, yapay zeka alt görevlere bölsün."}
          </DialogDescription>
        </DialogHeader>

        {!suggestion ? (
          <div className="flex flex-col gap-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Örn. Kullanıcı profil sayfasını yeniden tasarla: avatar yükleme, bildirim tercihleri ve şifre değiştirme bölümlerini içersin."
              className={`${fieldClass} resize-none`}
            />
            {error && <p className="text-xs text-[#ff6b5b]">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                onClick={handleSuggest}
                disabled={loading || !description.trim()}
                className="bg-[#ff6b5b] text-[#0d1b3a] hover:bg-[#ff8577] disabled:opacity-60"
              >
                {loading ? "Öneri üretiliyor..." : "Öner"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {subtasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    value={task.title}
                    onChange={(e) => updateSubtask(index, { title: e.target.value })}
                    placeholder="Alt görev başlığı"
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={task.estimated_hours ?? ""}
                    onChange={(e) =>
                      updateSubtask(index, {
                        estimated_hours: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="saat"
                    className={`${fieldClass} w-20 shrink-0`}
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    aria-label="Alt görevi kaldır"
                    className="shrink-0 text-[var(--text-muted)] hover:text-[#ff6b5b]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              {subtasks.length === 0 && <p className="text-xs text-[var(--text-muted)]">Alt görev kalmadı, ekleyebilirsin.</p>}
            </div>

            <button
              type="button"
              onClick={addSubtask}
              className="flex items-center gap-1.5 self-start text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <Plus className="size-3.5" />
              Alt görev ekle
            </button>

            {error && <p className="text-xs text-[#ff6b5b]">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleResolve("rejected")}
                disabled={resolving}
                className="border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                Reddet
              </Button>
              <Button
                type="button"
                onClick={() => handleResolve("accepted")}
                disabled={resolving || subtasks.length === 0 || subtasks.some((t) => !t.title.trim())}
                className="bg-[#ff6b5b] text-[#0d1b3a] hover:bg-[#ff8577] disabled:opacity-60"
              >
                {resolving ? "Kaydediliyor..." : `Onayla (${subtasks.length} görev oluştur)`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
