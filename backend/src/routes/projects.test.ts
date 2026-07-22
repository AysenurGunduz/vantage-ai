import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../lib/supabaseClient.js", () => {
  const insertedProject = { id: "project-1", organization_id: "org-1", name: "Website Redesign" };

  return {
    supabase: {
      auth: {
        getUser: vi.fn(async (token: string) =>
          token === "valid-token"
            ? { data: { user: { id: "user-1", email: "test@vantage.dev" } }, error: null }
            : { data: { user: null }, error: { message: "Invalid token" } }
        ),
      },
      from: vi.fn((table: string) => {
        if (table === "organization_members") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn(async () => ({ data: { role: "owner" } })),
          };
        }
        if (table === "projects") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: [insertedProject], error: null }),
            insert: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: insertedProject, error: null }),
          };
        }
        if (table === "project_members") {
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    },
  };
});

const { app } = await import("../app.js");

describe("projects routes", () => {
  it("lists projects for an organization the user belongs to", async () => {
    const res = await request(app)
      .get("/api/organizations/org-1/projects")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "project-1", organization_id: "org-1", name: "Website Redesign" }]);
  });

  it("creates a project when the user is a member", async () => {
    const res = await request(app)
      .post("/api/organizations/org-1/projects")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "Website Redesign" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "project-1", organization_id: "org-1", name: "Website Redesign" });
  });

  it("rejects an empty project name", async () => {
    const res = await request(app)
      .post("/api/organizations/org-1/projects")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "" });

    expect(res.status).toBe(400);
  });
});
