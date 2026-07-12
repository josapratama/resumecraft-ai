import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function makeCtx(user: User | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const SAMPLE_USER: User = {
  id: 42,
  username: "johndoe",
  passwordHash: "$2b$12$placeholder",
  email: "john@example.com",
  name: "John Doe",
  role: "user",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  lastSignedIn: new Date("2024-01-01"),
};

describe("auth.me", () => {
  it("returns null when unauthenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user data without passwordHash when authenticated", async () => {
    const caller = appRouter.createCaller(makeCtx(SAMPLE_USER));
    const result = await caller.auth.me();

    expect(result).not.toBeNull();
    expect(result?.id).toBe(42);
    expect(result?.username).toBe("johndoe");
    expect(result?.email).toBe("john@example.com");
    expect(result?.name).toBe("John Doe");
    // passwordHash must never be exposed
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("does not expose passwordHash even for admin users", async () => {
    const admin: User = { ...SAMPLE_USER, role: "admin" };
    const caller = appRouter.createCaller(makeCtx(admin));
    const result = await caller.auth.me();

    expect(result?.role).toBe("admin");
    expect(result).not.toHaveProperty("passwordHash");
  });
});
