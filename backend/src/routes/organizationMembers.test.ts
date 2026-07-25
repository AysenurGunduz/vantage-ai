import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

let membership: { role: string } | null = null;
let membersListResult: unknown[] = [];
let updatedMember: unknown = null;

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
      if (table !== "organization_members") {
        throw new Error(`Unexpected table: ${table}`);
      }

      const obj: Record<string, unknown> = {
        select: vi.fn(() => obj),
        update: vi.fn(() => obj),
        eq: vi.fn(() => obj),
        maybeSingle: vi.fn(async () => ({ data: membership, error: null })),
        single: vi.fn(async () => ({ data: updatedMember, error: null })),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({ data: membersListResult, error: null }).then(resolve),
      };
      return obj;
    }),
  },
}));

const { app } = await import("../app.js");

beforeEach(() => {
  membership = null;
  membersListResult = [];
  updatedMember = null;
});

describe("organization members routes", () => {
  it("rejects listing members for a non-member", async () => {
    const res = await request(app)
      .get("/api/organizations/org-1/members")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  it("lists members for an organization member", async () => {
    membership = { role: "member" };
    membersListResult = [{ user_id: "user-1", role: "member", joined_at: "2026-01-01" }];

    const res = await request(app)
      .get("/api/organizations/org-1/members")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(membersListResult);
  });

  it("rejects an invalid role", async () => {
    membership = { role: "owner" };

    const res = await request(app)
      .patch("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token")
      .send({ role: "superadmin" });

    expect(res.status).toBe(400);
  });

  it("rejects a role change from a non-owner", async () => {
    membership = { role: "admin" };

    const res = await request(app)
      .patch("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token")
      .send({ role: "admin" });

    expect(res.status).toBe(403);
  });

  it("updates a member's role when requested by an owner", async () => {
    membership = { role: "owner" };
    updatedMember = { organization_id: "org-1", user_id: "user-2", role: "admin" };

    const res = await request(app)
      .patch("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token")
      .send({ role: "admin" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updatedMember);
  });
});
