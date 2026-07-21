import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("./lib/supabaseClient.js", () => ({
  supabase: {
    auth: {
      admin: {
        listUsers: vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
      },
    },
  },
}));

const { app } = await import("./app.js");

describe("GET /api/health", () => {
  it("returns ok status and reports Supabase as connected", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", supabase: "connected" });
  });
});
