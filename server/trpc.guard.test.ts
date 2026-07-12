/**
 * Tests for tRPC middleware guards:
 * - publicProcedure: accessible to everyone
 * - protectedProcedure: throws UNAUTHORIZED when user is null
 */
import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
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
  id: 1,
  username: "test",
  passwordHash: "$2b$12$placeholder",
  email: "test@example.com",
  name: "Test User",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("protectedProcedure guard", () => {
  it("throws UNAUTHORIZED when no user in context", async () => {
    const caller = appRouter.createCaller(makeCtx(null));

    // cv.list is a protectedProcedure — should reject unauthenticated calls
    await expect(caller.cv.list()).rejects.toThrow(TRPCError);

    try {
      await caller.cv.list();
    } catch (err) {
      expect(err).toBeInstanceOf(TRPCError);
      expect((err as TRPCError).code).toBe("UNAUTHORIZED");
    }
  });

  it("allows access when user is in context", async () => {
    // cv.list requires DB — we just check it gets past the auth guard
    // by asserting the error is NOT an auth error (it will be a DB error instead)
    const caller = appRouter.createCaller(makeCtx(SAMPLE_USER));

    try {
      await caller.cv.list();
      // If DB is unavailable it throws, but NOT an UNAUTHORIZED error
    } catch (err) {
      if (err instanceof TRPCError) {
        expect(err.code).not.toBe("UNAUTHORIZED");
      }
      // Non-TRPCError (e.g. DB connection error) is also fine — auth passed
    }
  });
});

describe("publicProcedure accessibility", () => {
  it("auth.me is accessible without authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    // Should not throw UNAUTHORIZED — publicProcedure has no auth guard
    await expect(caller.auth.me()).resolves.toBeNull();
  });

  it("auth.logout is accessible without authentication", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
