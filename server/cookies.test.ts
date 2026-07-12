/**
 * Tests for getSessionCookieOptions — verifies that cookie security
 * settings are correctly derived from the request protocol.
 */
import { describe, expect, it } from "vitest";
import { getSessionCookieOptions } from "./_core/cookies";
import type { Request } from "express";

function makeReq(
  protocol: string,
  headers: Record<string, string> = {}
): Request {
  return { protocol, headers } as unknown as Request;
}

describe("getSessionCookieOptions", () => {
  describe("secure (HTTPS) requests", () => {
    it("sets secure=true and sameSite=none for https protocol", () => {
      const opts = getSessionCookieOptions(makeReq("https"));

      expect(opts.secure).toBe(true);
      expect(opts.sameSite).toBe("none");
      expect(opts.httpOnly).toBe(true);
      expect(opts.path).toBe("/");
    });

    it("sets secure=true when x-forwarded-proto is https", () => {
      const opts = getSessionCookieOptions(
        makeReq("http", { "x-forwarded-proto": "https" })
      );

      expect(opts.secure).toBe(true);
      expect(opts.sameSite).toBe("none");
    });

    it("sets secure=true when x-forwarded-proto contains https in a list", () => {
      const opts = getSessionCookieOptions(
        makeReq("http", { "x-forwarded-proto": "https, http" })
      );

      expect(opts.secure).toBe(true);
    });
  });

  describe("insecure (HTTP) requests", () => {
    it("sets secure=false and sameSite=lax for plain http", () => {
      const opts = getSessionCookieOptions(makeReq("http"));

      expect(opts.secure).toBe(false);
      expect(opts.sameSite).toBe("lax");
      expect(opts.httpOnly).toBe(true);
      expect(opts.path).toBe("/");
    });

    it("sets secure=false when x-forwarded-proto is absent", () => {
      const opts = getSessionCookieOptions(makeReq("http", {}));
      expect(opts.secure).toBe(false);
    });

    it("sets secure=false when x-forwarded-proto is only http", () => {
      const opts = getSessionCookieOptions(
        makeReq("http", { "x-forwarded-proto": "http" })
      );

      expect(opts.secure).toBe(false);
      expect(opts.sameSite).toBe("lax");
    });
  });

  describe("always-set properties", () => {
    it("always sets httpOnly=true regardless of protocol", () => {
      expect(getSessionCookieOptions(makeReq("https")).httpOnly).toBe(true);
      expect(getSessionCookieOptions(makeReq("http")).httpOnly).toBe(true);
    });

    it("always sets path=/", () => {
      expect(getSessionCookieOptions(makeReq("https")).path).toBe("/");
      expect(getSessionCookieOptions(makeReq("http")).path).toBe("/");
    });
  });
});
