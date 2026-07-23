import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/apiClient";
import type { Organization, Project, Task } from "../types/api";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu";
}

const inputClass =
  "rounded-[3px] border-[#201e1d]/15 bg-[#f3f2f2] focus-visible:border-[#0088b0] focus-visible:ring-[#0088b0]/30";
const submitButtonClass = "rounded-[3px] bg-[#0088b0] text-[#f3f2f2] hover:bg-[#1186ac]";

function selectableItemClass(selected: boolean) {
  return `w-full rounded-[3px] px-4 py-2.5 text-left text-sm transition-colors ${
    selected ? "bg-[#0088b0] text-[#f3f2f2]" : "bg-[#f3f2f2] hover:bg-[#0088b0]/10"
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

  return (
    <div className="editorial-theme min-h-screen bg-[#f3f2f2] text-[#201e1d]">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <img src="/logo.png" alt="Vantage" className="h-9 w-fit" />
            <p className="mt-2 text-sm text-[#201e1d]/60">Giriş yapıldı: {user?.email}</p>
            <Link to="/dashboard" className="mt-1 inline-block text-sm text-[#0088b0] hover:text-[#1186ac]">
              ← Panele dön
            </Link>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="rounded-[3px] border-[#201e1d]/15 text-[#201e1d] hover:bg-[#201e1d]/5"
          >
            Çıkış Yap
          </Button>
        </div>

        {error && (
          <p className="mb-6 rounded-[3px] bg-[#d6006c]/10 px-3 py-2 text-sm text-[#d6006c]">{error}</p>
        )}

        <div className="space-y-6">
          <section className="space-y-4 rounded-[4px] border border-[#201e1d]/10 bg-[#eae9e9]/50 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Organizasyonlar</h2>
            <ul className="space-y-2">
              {organizations.map((org) => (
                <li key={org.id}>
                  <button onClick={() => setSelectedOrgId(org.id)} className={selectableItemClass(selectedOrgId === org.id)}>
                    {org.name}
                  </button>
                </li>
              ))}
              {organizations.length === 0 && (
                <p className="text-sm text-[#201e1d]/50">Henüz bir organizasyonun yok.</p>
              )}
            </ul>
            <form onSubmit={handleCreateOrg} className="flex gap-2">
              <Input
                placeholder="Yeni organizasyon adı"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                required
                className={inputClass}
              />
              <Button type="submit" className={submitButtonClass}>
                Oluştur
              </Button>
            </form>
          </section>

          {selectedOrgId && (
            <section className="space-y-4 rounded-[4px] border border-[#201e1d]/10 bg-[#eae9e9]/50 p-6">
              <h2 className="text-lg font-semibold tracking-tight">Projeler</h2>
              <ul className="space-y-2">
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
                  <p className="text-sm text-[#201e1d]/50">Bu organizasyonda henüz bir proje yok.</p>
                )}
              </ul>
              <form onSubmit={handleCreateProject} className="flex gap-2">
                <Input
                  placeholder="Yeni proje adı"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  className={inputClass}
                />
                <Button type="submit" className={submitButtonClass}>
                  Oluştur
                </Button>
              </form>
            </section>
          )}

          {selectedProjectId && (
            <section className="space-y-4 rounded-[4px] border border-[#201e1d]/10 bg-[#eae9e9]/50 p-6">
              <h2 className="text-lg font-semibold tracking-tight">Görevler</h2>
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between rounded-[3px] bg-[#f3f2f2] px-4 py-2.5 text-sm"
                  >
                    <span>{task.title}</span>
                    <span className="flex items-center gap-2 text-xs text-[#201e1d]/60">
                      <span className="rounded-[3px] bg-[#201e1d]/10 px-2 py-0.5">{task.status}</span>
                      <span className="rounded-[3px] bg-[#201e1d]/10 px-2 py-0.5">{task.priority}</span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label="Görevi sil"
                        className="text-[#201e1d]/40 hover:text-[#d6006c]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </li>
                ))}
                {tasks.length === 0 && <p className="text-sm text-[#201e1d]/50">Bu projede henüz görev yok.</p>}
              </ul>
              <form onSubmit={handleCreateTask} className="flex gap-2">
                <Input
                  placeholder="Yeni görev başlığı"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className={inputClass}
                />
                <Button type="submit" className={submitButtonClass}>
                  Ekle
                </Button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
