import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiFetch } from "@/lib/apiClient";
import type { Project } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Proje adı en az 2 karakter olmalı")
    .max(60, "Proje adı en fazla 60 karakter olabilir"),
  description: z
    .string()
    .trim()
    .max(280, "Açıklama en fazla 280 karakter olabilir")
    .optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

const fieldClass =
  "w-full rounded-[6px] border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus-visible:border-[#ff6b5b] focus-visible:ring-2 focus-visible:ring-[#ff6b5b]/30";

export function CreateProjectDialog({
  organizationId,
  open,
  onOpenChange,
  onCreated,
}: {
  organizationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: Project) => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(values: CreateProjectForm) {
    if (!organizationId) return;
    setSubmitError(null);
    try {
      const project = await apiFetch<Project>(`/api/organizations/${organizationId}/projects`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      onCreated(project);
      reset();
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Yeni proje oluştur</DialogTitle>
          <DialogDescription>Projeye bir ad ver, açıklama eklemek istersen isteğe bağlı.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="project-name" className="mb-1.5 block text-xs font-medium text-white/60">
              Proje adı
            </label>
            <input
              id="project-name"
              autoFocus
              placeholder="Örn. Mobil uygulama yeniden tasarımı"
              className={fieldClass}
              {...register("name")}
            />
            {errors.name && <p className="mt-1.5 text-xs text-[#ff6b5b]">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="project-description" className="mb-1.5 block text-xs font-medium text-white/60">
              Açıklama <span className="text-white/30">(isteğe bağlı)</span>
            </label>
            <textarea
              id="project-description"
              rows={3}
              placeholder="Bu proje ne için kullanılacak?"
              className={`${fieldClass} resize-none`}
              {...register("description")}
            />
            {errors.description && <p className="mt-1.5 text-xs text-[#ff6b5b]">{errors.description.message}</p>}
          </div>

          {submitError && <p className="text-xs text-[#ff6b5b]">{submitError}</p>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 bg-transparent text-white hover:bg-white/5 hover:text-white"
            >
              Vazgeç
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ff6b5b] text-[#0d1b3a] hover:bg-[#ff8577] disabled:opacity-60"
            >
              {isSubmitting ? "Oluşturuluyor..." : "Projeyi oluştur"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
