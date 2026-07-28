import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

let invitation: {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
} | null = null;
let organization: { name: string } | null = null;
let existingMembership: { user_id: string } | null = null;
let memberInsertError: { message: string } | null = null;

vi.mock("../lib/supabaseClient.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token: string) =>
        token === "valid-token"
          ? { data: { user: { id: "user-1", email: "invited@vantage.dev" } }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } }
      ),
    },
    from: vi.fn((table: string) => {
      if (table === "organization_invitations") {
        const obj: Record<string, unknown> = {
          select: vi.fn(() => obj),
          update: vi.fn(() => obj),
          eq: vi.fn(() => obj),
          maybeSingle: vi.fn(async () => ({ data: invitation, error: null })),
        };
        return obj;
      }

      if (table === "organizations") {
        const obj: Record<string, unknown> = {
          select: vi.fn(() => obj),
          eq: vi.fn(() => obj),
          maybeSingle: vi.fn(async () => ({ data: organization, error: null })),
        };
        return obj;
      }

      if (table === "organization_members") {
        const obj: Record<string, unknown> = {
          select: vi.fn(() => obj),
          eq: vi.fn(() => obj),
          insert: vi.fn(() => obj),
          maybeSingle: vi.fn(async () => ({ data: existingMembership, error: null })),
          then: (resolve: (value: unknown) => unknown) =>
            Promise.resolve({ data: null, error: memberInsertError }).then(resolve),
        };
        return obj;
      }

      throw new Error(`Unexpected table: ${table}`);
    }),
  },
}));

const { app } = await import("../app.js");

beforeEach(() => {
  invitation = null;
  organization = null;
  existingMembership = null;
  memberInsertError = null;
});

describe("invitation lookup", () => {
  it("returns 404 for an unknown token", async () => {
    const res = await request(app)
      .get("/api/invitations/bad-token")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(404);
  });

  it("returns 410 for an already-accepted invitation", async () => {
    invitation = {
      id: "inv-1",
      organization_id: "org-1",
      email: "invited@vantage.dev",
      role: "member",
      status: "accepted",
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    };

    const res = await request(app)
      .get("/api/invitations/tok-1")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(410);
  });

  it("returns 403 when the invitation was issued to a different email", async () => {
    invitation = {
      id: "inv-1",
      organization_id: "org-1",
      email: "someone-else@vantage.dev",
      role: "member",
      status: "pending",
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    };

    const res = await request(app)
      .get("/api/invitations/tok-1")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(403);
  });

  it("returns invitation details for a valid pending invitation", async () => {
    invitation = {
      id: "inv-1",
      organization_id: "org-1",
      email: "invited@vantage.dev",
      role: "member",
      status: "pending",
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    };
    organization = { name: "Vantage Org" };

    const res = await request(app)
      .get("/api/invitations/tok-1")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      organization_id: "org-1",
      organization_name: "Vantage Org",
      email: "invited@vantage.dev",
      role: "member",
    });
  });
});

describe("invitation acceptance", () => {
  it("rejects accepting when already a member", async () => {
    invitation = {
      id: "inv-1",
      organization_id: "org-1",
      email: "invited@vantage.dev",
      role: "member",
      status: "pending",
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    };
    existingMembership = { user_id: "user-1" };

    const res = await request(app)
      .post("/api/invitations/tok-1/accept")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(409);
  });

  it("creates a membership when accepting a valid invitation", async () => {
    invitation = {
      id: "inv-1",
      organization_id: "org-1",
      email: "invited@vantage.dev",
      role: "admin",
      status: "pending",
      expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    };

    const res = await request(app)
      .post("/api/invitations/tok-1/accept")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ organization_id: "org-1", role: "admin" });
  });
});
