import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

type ChainConfig = {
  maybeSingle?: unknown;
  order?: unknown;
};

function chain(config: ChainConfig) {
  const obj: Record<string, unknown> = {
    select: vi.fn(() => obj),
    eq: vi.fn(() => obj),
    gte: vi.fn(() => obj),
    order: vi.fn(() => Promise.resolve(config.order)),
    maybeSingle: vi.fn(() => Promise.resolve(config.maybeSingle)),
  };
  return obj;
}

let membership: { role_in_project: string } | null = null;
let project: { name: string } | null = { name: "Vantage Web" };
let completedTasks: { title: string }[] = [];
let generateTextResult = "Bu sprintte üç görev tamamlandı.";
let generateTextShouldThrow = false;

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
      if (table === "projects") {
        return chain({ maybeSingle: { data: project, error: null } });
      }
      if (table === "tasks") {
        return chain({ order: { data: completedTasks, error: null } });
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  },
}));

vi.mock("../ai/index.js", () => ({
  interactiveAI: {
    generateJSON: vi.fn(async () => ({})),
    generateText: vi.fn(async () => {
      if (generateTextShouldThrow) throw new Error("model unreachable");
      return generateTextResult;
    }),
  },
}));

const { app } = await import("../app.js");

beforeEach(() => {
  membership = null;
  project = { name: "Vantage Web" };
  completedTasks = [];
  generateTextResult = "Bu sprintte üç görev tamamlandı.";
  generateTextShouldThrow = false;
});

describe("POST /api/projects/:projectId/sprint-summary", () => {
  it("rejects a non-project-member", async () => {
    membership = null;

    const res = await request(app)
      .post("/api/projects/project-1/sprint-summary")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(403);
  });

  it("returns 404 for a project that doesn't exist", async () => {
    membership = { role_in_project: "member" };
    project = null;

    const res = await request(app)
      .post("/api/projects/project-1/sprint-summary")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(404);
  });

  it("returns a null summary when there are no recently completed tasks", async () => {
    membership = { role_in_project: "member" };
    completedTasks = [];

    const res = await request(app)
      .post("/api/projects/project-1/sprint-summary")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ summary: null, taskCount: 0, periodDays: 7 });
  });

  it("generates a summary from recently completed tasks", async () => {
    membership = { role_in_project: "member" };
    completedTasks = [{ title: "Görev A" }, { title: "Görev B" }];

    const res = await request(app)
      .post("/api/projects/project-1/sprint-summary")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ summary: generateTextResult, taskCount: 2, periodDays: 7 });
  });

  it("returns 502 when the AI call throws", async () => {
    membership = { role_in_project: "member" };
    completedTasks = [{ title: "Görev A" }];
    generateTextShouldThrow = true;

    const res = await request(app)
      .post("/api/projects/project-1/sprint-summary")
      .set("Authorization", "Bearer valid-token")
      .send({});

    expect(res.status).toBe(502);
  });
});
