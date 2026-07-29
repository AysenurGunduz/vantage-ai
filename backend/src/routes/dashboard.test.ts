import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

function chain(result: unknown) {
  const obj: Record<string, unknown> = {
    select: vi.fn(() => obj),
    eq: vi.fn(() => obj),
    in: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  return obj;
}

let membershipRows: { project_id: string }[] = [];
let taskRows: {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: string;
}[] = [];

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
        return chain({ data: membershipRows, error: null });
      }
      if (table === "tasks") {
        return chain({ data: taskRows, error: null });
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  },
}));

const { app } = await import("../app.js");

beforeEach(() => {
  membershipRows = [];
  taskRows = [];
});

describe("dashboard routes", () => {
  it("returns zeroed stats when the user has no projects", async () => {
    const res = await request(app).get("/api/dashboard/stats").set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalTasks: 0,
      byStatus: { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      overdueTasks: [],
    });
  });

  it("aggregates task counts by status and priority, and flags overdue tasks", async () => {
    membershipRows = [{ project_id: "project-1" }];
    taskRows = [
      { id: "task-1", title: "Old task", status: "todo", priority: "high", due_date: "2020-01-01", project_id: "project-1" },
      { id: "task-2", title: "Done task", status: "done", priority: "low", due_date: "2020-01-01", project_id: "project-1" },
      { id: "task-3", title: "Fresh task", status: "in_progress", priority: "urgent", due_date: null, project_id: "project-1" },
    ];

    const res = await request(app).get("/api/dashboard/stats").set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.totalTasks).toBe(3);
    expect(res.body.byStatus).toEqual({ backlog: 0, todo: 1, in_progress: 1, review: 0, done: 1 });
    expect(res.body.byPriority).toEqual({ low: 1, medium: 0, high: 1, urgent: 1 });
    expect(res.body.overdueTasks).toEqual([
      { id: "task-1", title: "Old task", status: "todo", priority: "high", due_date: "2020-01-01", project_id: "project-1" },
    ]);
  });

  it("rejects requests without a valid token", async () => {
    const res = await request(app).get("/api/dashboard/stats").set("Authorization", "Bearer bad-token");

    expect(res.status).toBe(401);
  });
});
