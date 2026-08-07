import { useState } from "react";
import { Check, Copy, FileText } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import type { SprintSummaryResult } from "@/types/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SprintSummaryDialog({
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
  const [result, setResult] = useState<SprintSummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setResult(null);
    setError(null);
    setCopied(false);
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await apiFetch<SprintSummaryResult>(`/api/projects/${projectId}/sprint-summary`, {
        method: "POST",
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sprint özeti üretilemedi, tekrar dener misin?");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.summary) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
            <FileText className="size-4 text-[#ff6b5b]" />
            Sprint özeti
          </DialogTitle>
          <DialogDescription>
            Son 7 günde tamamlanan görevlerden, ekiple ya da müşteriyle paylaşabileceğin bir özet üretir.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="flex flex-col gap-4">
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
                onClick={handleGenerate}
                disabled={loading}
                className="bg-[#ff6b5b] text-[#0d1b3a] hover:bg-[#ff8577] disabled:opacity-60"
              >
                {loading ? "Özet üretiliyor..." : "Oluştur"}
              </Button>
            </div>
          </div>
        ) : result.summary === null ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Son {result.periodDays} günde tamamlanmış bir görev bulunamadı, özetlenecek bir şey yok.
            </p>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                Kapat
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              Son {result.periodDays} günde tamamlanan {result.taskCount} görevden üretildi.
            </p>
            <div className="max-h-72 overflow-y-auto rounded-[6px] border border-[var(--surface-border)] bg-[var(--surface)] p-3.5 text-sm whitespace-pre-wrap text-[var(--text-primary)]">
              {result.summary}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                disabled={loading}
                className="border-[var(--surface-border)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                {loading ? "Yeniden üretiliyor..." : "Yeniden Oluştur"}
              </Button>
              <Button
                type="button"
                onClick={handleCopy}
                className="bg-[#ff6b5b] text-[#0d1b3a] hover:bg-[#ff8577]"
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Kopyalandı" : "Kopyala"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
