import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

let membership: { role: string } | null = null;
let targetMembership: { role: string } | null = null;
let membersListResult: unknown[] = [];
let updatedMember: unknown = null;
let organizationRow: { owner_id: string } | null = null;

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
      if (table === "organizations") {
        const obj: Record<string, unknown> = {
          select: vi.fn(() => obj),
          eq: vi.fn(() => obj),
          maybeSingle: vi.fn(async () => ({ data: organizationRow, error: null })),
        };
        return obj;
      }

      if (table !== "organization_members") {
        throw new Error(`Unexpected table: ${table}`);
      }

      let lastUserId: string | undefined;
      const obj: Record<string, unknown> = {
        select: vi.fn(() => obj),
        update: vi.fn(() => obj),
        delete: vi.fn(() => obj),
        eq: vi.fn((column: string, value: string) => {
          if (column === "user_id") lastUserId = value;
          return obj;
        }),
        maybeSingle: vi.fn(async () => ({
          data: lastUserId === "user-2" ? targetMembership : membership,
          error: null,
        })),
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
  targetMembership = null;
  membersListResult = [];
  updatedMember = null;
  organizationRow = { owner_id: "someone-else" };
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

  it("rejects removing a member from a non-admin/non-owner", async () => {
    membership = { role: "member" };

    const res = await request(app)
      .delete("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  it("rejects removing yourself", async () => {
    membership = { role: "owner" };

    const res = await request(app)
      .delete("/api/organizations/org-1/members/user-1")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(400);
  });

  it("rejects removing the organization owner", async () => {
    membership = { role: "owner" };
    organizationRow = { owner_id: "user-2" };

    const res = await request(app)
      .delete("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(400);
  });

  it("rejects an admin removing another admin", async () => {
    membership = { role: "admin" };
    targetMembership = { role: "admin" };

    const res = await request(app)
      .delete("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  it("removes a plain member when requested by an admin", async () => {
    membership = { role: "admin" };
    targetMembership = { role: "member" };

    const res = await request(app)
      .delete("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(204);
  });

  it("removes an admin when requested by an owner", async () => {
    membership = { role: "owner" };
    targetMembership = { role: "admin" };

    const res = await request(app)
      .delete("/api/organizations/org-1/members/user-2")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(204);
  });
});
