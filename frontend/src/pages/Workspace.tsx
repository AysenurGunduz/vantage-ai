import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Building2, ChevronRight, FolderKanban, ListTodo, Plus } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/apiClient";
import type { Organization, Project, Task, TaskStatus } from "../types/api";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu";
}

const inputClass =
  "rounded-[3px] border-white/15 bg-white/5 text-white focus-visible:border-[#ff6b5b] focus-visible:ring-[#ff6b5b]/30";
const submitButtonClass =
  "rounded-[3px] bg-[#ff6b5b] text-[#0d1b3a] transition-colors hover:bg-[#ff8577]";
const panelClass = "rounded-[4px] border border-white/10 bg-white/[0.03] p-5 transition-colors";

function selectableItemClass(selected: boolean) {
  return `flex w-full items-center gap-2 rounded-[3px] border-l-2 px-3 py-2.5 text-left text-sm transition-colors ${
    selected
      ? "border-[#ff6b5b] bg-[#ff6b5b]/10 text-white"
      : "border-transparent text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
  }`;
}

export default function Workspace() {
  const { user, signOut } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [error, setError] = useState<string | null>(null);

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId) ?? null;
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;

  useEffect(() => {
    apiFetch<Organization[]>("/api/organizations")
      .then(setOrganizations)
      .catch((err: unknown) => setError(errorMessage(err)));
  }, []);

  useEffect(() => {
    if (!selectedOrgId) {
      setProjects([]);
      setSelectedProjectId(null);
      return;
    }
    apiFetch<Project[]>(`/api/organizations/${selectedOrgId}/projects`)
      .then(setProjects)
      .catch((err: unknown) => setError(errorMessage(err)));
  }, [selectedOrgId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }
    apiFetch<Task[]>(`/api/projects/${selectedProjectId}/tasks`)
      .then(setTasks)
      .catch((err: unknown) => setError(errorMessage(err)));
  }, [selectedProjectId]);

  async function handleCreateOrg(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const org = await apiFetch<Organization>("/api/organizations", {
        method: "POST",
        body: JSON.stringify({ name: newOrgName }),
      });
      setOrganizations((prev) => [...prev, { ...org, role: "owner" }]);
      setNewOrgName("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleCreateProject(event: FormEvent) {
    event.preventDefault();
    if (!selectedOrgId) return;
    setError(null);
    try {
      const project = await apiFetch<Project>(`/api/organizations/${selectedOrgId}/projects`, {
        method: "POST",
        body: JSON.stringify({ name: newProjectName }),
      });
      setProjects((prev) => [project, ...prev]);
      setNewProjectName("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleCreateTask(event: FormEvent) {
    event.preventDefault();
    if (!selectedProjectId) return;
    setError(null);
    try {
      const task = await apiFetch<Task>(`/api/projects/${selectedProjectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title: newTaskTitle }),
      });
      setTasks((prev) => [...prev, task]);
      setNewTaskTitle("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleDeleteTask(taskId: string) {
    setError(null);
    try {
      await apiFetch<void>(`/api/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleStatusChange(taskId: string, status: TaskStatus) {
    const previousTasks = tasks;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status } : task)));
    setError(null);
    try {
      await apiFetch<Task>(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      setTasks(previousTasks);
      setError(errorMessage(err));
    }
  }

  return (
    <div className="dark-theme min-h-screen bg-[#0d1b3a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Logo />
            <Link
              to="/dashboard"
              className="mt-2 inline-block text-sm text-white/50 transition-colors hover:text-[#ff6b5b]"
            >
              ← Panele dön
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-white/50 sm:inline">{user?.email}</span>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="rounded-[3px] border-white/20 bg-transparent text-white transition-colors hover:bg-white/5"
            >
              Çıkış Yap
            </Button>
          </div>
        </div>

        {error && (
          <p className="mb-6 rounded-[3px] bg-[#ff6b5b]/10 px-3 py-2 text-sm text-[#ff6b5b]">{error}</p>
        )}

        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-72">
            <section className={panelClass}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Building2 className="size-4 text-[#ff6b5b]" />
                Organizasyonlar
              </div>
              <ul className="space-y-1">
                {organizations.map((org) => (
                  <li key={org.id}>
                    <button onClick={() => setSelectedOrgId(org.id)} className={selectableItemClass(selectedOrgId === org.id)}>
                      {org.name}
                    </button>
                  </li>
                ))}
                {organizations.length === 0 && (
                  <p className="px-1 py-2 text-sm text-white/40">Henüz bir organizasyonun yok.</p>
                )}
              </ul>
              <form onSubmit={handleCreateOrg} className="mt-3 flex gap-2">
                <Input
                  placeholder="Yeni organizasyon"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required
                  className={inputClass}
                />
                <Button type="submit" size="icon" className={`${submitButtonClass} shrink-0`} aria-label="Organizasyon oluştur">
                  <Plus className="size-4" />
                </Button>
              </form>
            </section>

            {selectedOrgId && (
              <section className={panelClass}>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-tight">
                  <FolderKanban className="size-4 text-[#ff6b5b]" />
                  Projeler
                </div>
                <ul className="space-y-1">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <button
                        onClick={() => setSelectedProjectId(project.id)}
                        className={selectableItemClass(selectedProjectId === project.id)}
                      >
                        {project.name}
                      </button>
                    </li>
                  ))}
                  {projects.length === 0 && (
                    <p className="px-1 py-2 text-sm text-white/40">Bu organizasyonda henüz bir proje yok.</p>
                  )}
                </ul>
                <form onSubmit={handleCreateProject} className="mt-3 flex gap-2">
                  <Input
                    placeholder="Yeni proje"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                    className={inputClass}
                  />
                  <Button type="submit" size="icon" className={`${submitButtonClass} shrink-0`} aria-label="Proje oluştur">
                    <Plus className="size-4" />
                  </Button>
                </form>
              </section>
            )}
          </aside>

          <main className="min-w-0 flex-1">
            {selectedProjectId ? (
              <section className={panelClass}>
                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/50">
                  <span>{selectedOrg?.name}</span>
                  <ChevronRight className="size-3.5" />
                  <span className="font-semibold text-white">{selectedProject?.name}</span>
                </div>
                <form onSubmit={handleCreateTask} className="mb-5 flex gap-2">
                  <Input
                    placeholder="Yeni görev başlığı"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                    className={inputClass}
                  />
                  <Button type="submit" className={submitButtonClass}>
                    <Plus className="size-4" />
                    Ekle
                  </Button>
                </form>
                <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} />
              </section>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-[4px] border border-dashed border-white/15 px-6 text-center">
                <ListTodo className="size-8 text-white/25" />
                <p className="max-w-xs text-sm text-white/40">
                  Görevleri görüntülemek için önce sol taraftan bir organizasyon ve proje seç.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
