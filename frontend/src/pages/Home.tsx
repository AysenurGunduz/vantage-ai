import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../lib/AuthContext";
import { apiFetch } from "../lib/apiClient";
import type { Organization, Project, Task } from "../types/api";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu";
}

export default function Home() {
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
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Vantage</h1>
            <p className="text-sm text-slate-500">Giriş yapıldı: {user?.email}</p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Çıkış Yap
          </Button>
        </div>

        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-800">Organizasyonlar</h2>
          <ul className="space-y-1.5">
            {organizations.map((org) => (
              <li key={org.id}>
                <button
                  onClick={() => setSelectedOrgId(org.id)}
                  className={`w-full rounded px-3 py-2 text-left text-sm ${
                    selectedOrgId === org.id ? "bg-slate-800 text-white" : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {org.name}
                </button>
              </li>
            ))}
            {organizations.length === 0 && (
              <p className="text-sm text-slate-400">Henüz bir organizasyonun yok.</p>
            )}
          </ul>
          <form onSubmit={handleCreateOrg} className="flex gap-2">
            <Input
              placeholder="Yeni organizasyon adı"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              required
            />
            <Button type="submit">Oluştur</Button>
          </form>
        </section>

        {selectedOrgId && (
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-800">Projeler</h2>
            <ul className="space-y-1.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`w-full rounded px-3 py-2 text-left text-sm ${
                      selectedProjectId === project.id
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
              {projects.length === 0 && (
                <p className="text-sm text-slate-400">Bu organizasyonda henüz bir proje yok.</p>
              )}
            </ul>
            <form onSubmit={handleCreateProject} className="flex gap-2">
              <Input
                placeholder="Yeni proje adı"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />
              <Button type="submit">Oluştur</Button>
            </form>
          </section>
        )}

        {selectedProjectId && (
          <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-800">Görevler</h2>
            <ul className="space-y-1.5">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between rounded bg-slate-100 px-3 py-2 text-sm"
                >
                  <span>{task.title}</span>
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-200 px-2 py-0.5">{task.status}</span>
                    <span className="rounded bg-slate-200 px-2 py-0.5">{task.priority}</span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      aria-label="Görevi sil"
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </li>
              ))}
              {tasks.length === 0 && <p className="text-sm text-slate-400">Bu projede henüz görev yok.</p>}
            </ul>
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <Input
                placeholder="Yeni görev başlığı"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
              <Button type="submit">Ekle</Button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
