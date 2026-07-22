import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";

vi.mock("../lib/supabaseClient.js", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async (token: string) => {
        if (token === "valid-token") {
          return { data: { user: { id: "user-1", email: "test@vantage.dev" } }, error: null };
        }
        return { data: { user: null }, error: { message: "Invalid token" } };
      }),
    },
  },
}));

const { requireAuth } = await import("./requireAuth.js");

function mockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("requireAuth", () => {
  it("returns 401 when no Authorization header is present", async () => {
    const req = { headers: {} } as Request;
    const res = mockResponse();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the token is invalid", async () => {
    const req = { headers: { authorization: "Bearer bad-token" } } as Request;
    const res = mockResponse();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the user and calls next() when the token is valid", async () => {
    const req = { headers: { authorization: "Bearer valid-token" } } as Request;
    const res = mockResponse();
    const next = vi.fn();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: "user-1", email: "test@vantage.dev" });
  });
});
