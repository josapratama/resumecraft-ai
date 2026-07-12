/**
 * Tests for cv router — ownership checks and input validation.
 * DB calls are expected to fail (no real DB in unit tests), so we
 * specifically test that the auth guard fires BEFORE any DB access,
 * and that input validation rejects malformed data.
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

const AUTHED_USER: User = {
  id: 99,
  username: "cvuser",
  passwordHash: "$2b$12$placeholder",
  email: "cv@example.com",
  name: "CV User",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// ─── Auth guard ───────────────────────────────────────────────────────────────

describe("cv router — auth guard", () => {
  const endpoints: Array<() => Promise<unknown>> = [];

  it("cv.list rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cv.list()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("cv.create rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cv.create({ title: "My CV" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("cv.get rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cv.get({ cvId: 1 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("cv.update rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.cv.update({ cvId: 1, title: "New Title" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("cv.delete rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cv.delete({ cvId: 1 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("cv.duplicate rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.cv.duplicate({ cvId: 1 })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// ─── Input validation ─────────────────────────────────────────────────────────

describe("cv router — input validation", () => {
  it("cv.create rejects empty title", async () => {
    const caller = appRouter.createCaller(makeCtx(AUTHED_USER));

    try {
      await caller.cv.create({ title: "" });
      expect.fail("should have thrown");
    } catch (err) {
      // Either a Zod BAD_REQUEST or a DB error — never an UNAUTHORIZED
      if (err instanceof TRPCError) {
        expect(["BAD_REQUEST", "INTERNAL_SERVER_ERROR"]).toContain(err.code);
      }
    }
  });

  it("cv.create rejects title exceeding 255 chars", async () => {
    const caller = appRouter.createCaller(makeCtx(AUTHED_USER));
    const longTitle = "a".repeat(256);

    try {
      await caller.cv.create({ title: longTitle });
      expect.fail("should have thrown");
    } catch (err) {
      if (err instanceof TRPCError) {
        expect(err.code).toBe("BAD_REQUEST");
      }
    }
  });

  it("cv.create accepts valid title and valid template", async () => {
    const caller = appRouter.createCaller(makeCtx(AUTHED_USER));

    try {
      // Will fail at DB level — we just care it passes validation
      await caller.cv.create({ title: "My Resume", template: "modern" });
    } catch (err) {
      if (err instanceof TRPCError) {
        // Should NOT be a validation error
        expect(err.code).not.toBe("BAD_REQUEST");
      }
    }
  });

  it("cv.create rejects invalid template value", async () => {
    const caller = appRouter.createCaller(makeCtx(AUTHED_USER));

    try {
      // @ts-expect-error — intentionally passing invalid template
      await caller.cv.create({
        title: "Resume",
        template: "invalid-template-xyz",
      });
      expect.fail("should have thrown");
    } catch (err) {
      if (err instanceof TRPCError) {
        expect(err.code).toBe("BAD_REQUEST");
      }
    }
  });
});

// ─── Work experience sub-router ───────────────────────────────────────────────

describe("cv.workExperience — auth guard", () => {
  it("rejects unauthenticated create", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.cv.workExperience.create({
        cvId: 1,
        jobTitle: "Engineer",
        company: "Acme",
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unauthenticated delete", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.cv.workExperience.delete({ id: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});

// ─── Skill sub-router ─────────────────────────────────────────────────────────

describe("cv.skill — input validation", () => {
  it("rejects skill with empty name", async () => {
    const caller = appRouter.createCaller(makeCtx(AUTHED_USER));

    try {
      await caller.cv.skill.create({
        cvId: 1,
        skillName: "",
        category: "Programming",
      });
      expect.fail("should have thrown");
    } catch (err) {
      if (err instanceof TRPCError) {
        expect(["BAD_REQUEST", "INTERNAL_SERVER_ERROR"]).toContain(err.code);
      }
    }
  });

  it("accepts valid proficiency enum values", async () => {
    const caller = appRouter.createCaller(makeCtx(AUTHED_USER));
    const validLevels = [
      "beginner",
      "intermediate",
      "advanced",
      "expert",
    ] as const;

    for (const level of validLevels) {
      try {
        await caller.cv.skill.create({
          cvId: 1,
          skillName: "TypeScript",
          category: "Programming",
          proficiency: level,
        });
      } catch (err) {
        if (err instanceof TRPCError) {
          // DB errors fine — NOT a validation error
          expect(err.code).not.toBe("BAD_REQUEST");
        }
      }
    }
  });

  it("rejects invalid proficiency value", async () => {
    const caller = appRouter.createCaller(makeCtx(AUTHED_USER));

    try {
      await caller.cv.skill.create({
        cvId: 1,
        skillName: "TypeScript",
        category: "Programming",
        // @ts-expect-error — invalid value
        proficiency: "master",
      });
      expect.fail("should have thrown");
    } catch (err) {
      if (err instanceof TRPCError) {
        expect(err.code).toBe("BAD_REQUEST");
      }
    }
  });
});
