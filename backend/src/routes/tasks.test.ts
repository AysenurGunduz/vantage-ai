import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

type ChainConfig = {
  maybeSingle?: unknown;
  single?: unknown;
  order?: unknown;
  then?: unknown;
};

function chain(config: ChainConfig) {
  const obj: Record<string, unknown> = {
    select: vi.fn(() => obj),
    insert: vi.fn(() => obj),
    update: vi.fn(() => obj),
    delete: vi.fn(() => obj),
    eq: vi.fn(() => obj),
    order: vi.fn(() => Promise.resolve(config.order)),
    maybeSingle: vi.fn(() => Promise.resolve(config.maybeSingle)),
    single: vi.fn(() => Promise.resolve(config.single)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(config.then).then(resolve),
  };
  return obj;
}

let membership: { role_in_project: string } | null = null;
let taskResponses: ReturnType<typeof chain>[] = [];

vi.mock("../lib/supabaseClient.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token: string) =>
        token === "valid-token"
          ? { data: { user: { id: "user-1", email: "test@vantage.dev" } }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } }
      ),
    },
    from: vi.fn((table: string) => {
      if (table === "project_members") {
        return chain({ maybeSingle: { data: membership, error: null } });
      }
      if (table === "tasks") {
        return taskResponses.shift();
      }
      if (table === "task_activity_log") {
        return chain({ then: { error: null } });
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  },
}));

const { app } = await import("../app.js");
const { supabase } = await import("../lib/supabaseClient.js");

beforeEach(() => {
  membership = null;
  taskResponses = [];
});

describe("tasks routes", () => {
  it("rejects listing tasks for a non-project-member", async () => {
    const res = await request(app)
      .get("/api/projects/project-1/tasks")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  it("lists tasks for a project member", async () => {
    membership = { role_in_project: "member" };
    const taskList = [{ id: "task-1", project_id: "project-1", title: "Design schema" }];
    taskResponses = [chain({ order: { data: taskList, error: null } })];

    const res = await request(app)
      .get("/api/projects/project-1/tasks")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(taskList);
  });

  it("rejects creating a task without a title", async () => {
    membership = { role_in_project: "member" };

    const res = await request(app)
      .post("/api/projects/project-1/tasks")
      .set("Authorization", "Bearer valid-token")
      .send({ title: "  " });

    expect(res.status).toBe(400);
  });

  it("creates a task when the user is a project member", async () => {
    membership = { role_in_project: "member" };
    const insertedTask = { id: "task-1", project_id: "project-1", title: "Design schema", priority: "medium" };
    taskResponses = [chain({ single: { data: insertedTask, error: null } })];

    const res = await request(app)
      .post("/api/projects/project-1/tasks")
      .set("Authorization", "Bearer valid-token")
      .send({ title: "Design schema" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(insertedTask);
  });

  it("logs a 'created' activity entry when a task is made", async () => {
    membership = { role_in_project: "member" };
    const insertedTask = { id: "task-1", project_id: "project-1", title: "Design schema", priority: "medium" };
    taskResponses = [chain({ single: { data: insertedTask, error: null } })];

    await request(app)
      .post("/api/projects/project-1/tasks")
      .set("Authorization", "Bearer valid-token")
      .send({ title: "Design schema" });

    expect(vi.mocked(supabase.from)).toHaveBeenCalledWith("task_activity_log");
  });

  it("creates a task with tags", async () => {
    membership = { role_in_project: "member" };
    const insertedTask = {
      id: "task-1",
      project_id: "project-1",
      title: "Design schema",
      priority: "medium",
      tags: ["backend", "urgent-fix"],
    };
    taskResponses = [chain({ single: { data: insertedTask, error: null } })];

    const res = await request(app)
      .post("/api/projects/project-1/tasks")
      .set("Authorization", "Bearer valid-token")
      .send({ title: "Design schema", tags: ["backend", "urgent-fix"] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(insertedTask);
  });

  it("returns 404 for a task that doesn't exist", async () => {
    taskResponses = [chain({ maybeSingle: { data: null, error: null } })];

    const res = await request(app).get("/api/tasks/missing-task").set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(404);
  });

  it("returns a task for a project member", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema" };
    membership = { role_in_project: "member" };
    taskResponses = [chain({ maybeSingle: { data: taskRow, error: null } })];

    const res = await request(app).get("/api/tasks/task-1").set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(taskRow);
  });

  it("rejects an update with no updatable fields", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema" };
    membership = { role_in_project: "member" };
    taskResponses = [chain({ maybeSingle: { data: taskRow, error: null } })];

    const res = await request(app)
      .patch("/api/tasks/task-1")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(400);
  });

  it("updates a task's status", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema" };
    const updatedTask = { ...taskRow, status: "in_progress" };
    membership = { role_in_project: "member" };
    taskResponses = [
      chain({ maybeSingle: { data: taskRow, error: null } }),
      chain({ single: { data: updatedTask, error: null } }),
    ];

    const res = await request(app)
      .patch("/api/tasks/task-1")
      .set("Authorization", "Bearer valid-token")
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedTask);
  });

  it("logs a 'status' activity entry when a task's status changes", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema", status: "todo" };
    const updatedTask = { ...taskRow, status: "in_progress" };
    membership = { role_in_project: "member" };
    taskResponses = [
      chain({ maybeSingle: { data: taskRow, error: null } }),
      chain({ single: { data: updatedTask, error: null } }),
    ];

    await request(app)
      .patch("/api/tasks/task-1")
      .set("Authorization", "Bearer valid-token")
      .send({ status: "in_progress" });

    expect(vi.mocked(supabase.from)).toHaveBeenCalledWith("task_activity_log");
  });

  it("updates a task's tags", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema", tags: [] };
    const updatedTask = { ...taskRow, tags: ["design", "review"] };
    membership = { role_in_project: "member" };
    taskResponses = [
      chain({ maybeSingle: { data: taskRow, error: null } }),
      chain({ single: { data: updatedTask, error: null } }),
    ];

    const res = await request(app)
      .patch("/api/tasks/task-1")
      .set("Authorization", "Bearer valid-token")
      .send({ tags: ["design", "review"] });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedTask);
  });

  it("rejects deleting another member's task for a plain member", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema", created_by: "someone-else" };
    membership = { role_in_project: "member" };
    taskResponses = [chain({ maybeSingle: { data: taskRow, error: null } })];

    const res = await request(app).delete("/api/tasks/task-1").set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  it("allows the task creator to delete their own task", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema", created_by: "user-1" };
    membership = { role_in_project: "member" };
    taskResponses = [
      chain({ maybeSingle: { data: taskRow, error: null } }),
      chain({ then: { error: null } }),
    ];

    const res = await request(app).delete("/api/tasks/task-1").set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(204);
  });

  it("allows a project admin to delete another member's task", async () => {
    const taskRow = { id: "task-1", project_id: "project-1", title: "Design schema", created_by: "someone-else" };
    membership = { role_in_project: "admin" };
    taskResponses = [
      chain({ maybeSingle: { data: taskRow, error: null } }),
      chain({ then: { error: null } }),
    ];

    const res = await request(app).delete("/api/tasks/task-1").set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(204);
  });
});
