import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../lib/supabaseClient.js", () => {
  const insertedOrg = { id: "org-1", name: "Acme", slug: "acme-abc123", owner_id: "user-1" };

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
            eq: vi.fn().mockResolvedValue({
              data: [{ role: "owner", organizations: insertedOrg }],
              error: null,
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "organizations") {
          return {
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: insertedOrg, error: null }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    },
  };
});

const { app } = await import("../app.js");

describe("organizations routes", () => {
  it("rejects requests without a valid token", async () => {
    const res = await request(app).get("/api/organizations");
    expect(res.status).toBe(401);
  });

  it("lists organizations the user belongs to", async () => {
    const res = await request(app)
      .get("/api/organizations")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "org-1", name: "Acme", slug: "acme-abc123", owner_id: "user-1", role: "owner" }]);
  });

  it("creates an organization and returns it", async () => {
    const res = await request(app)
      .post("/api/organizations")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "Acme" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "org-1", name: "Acme", slug: "acme-abc123", owner_id: "user-1" });
  });

  it("rejects an empty organization name", async () => {
    const res = await request(app)
      .post("/api/organizations")
      .set("Authorization", "Bearer valid-token")
      .send({ name: "  " });

    expect(res.status).toBe(400);
  });
});
