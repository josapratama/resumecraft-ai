import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { hashPassword, signSession, verifyPassword } from "./auth";

export function registerAuthRoutes(app: Express) {
  // POST /api/auth/register
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, name } = req.body ?? {};

      if (!username || !password) {
        res.status(400).json({ error: "username and password are required" });
        return;
      }
      if (typeof username !== "string" || username.length < 3) {
        res
          .status(400)
          .json({ error: "username must be at least 3 characters" });
        return;
      }
      if (typeof password !== "string" || password.length < 6) {
        res
          .status(400)
          .json({ error: "password must be at least 6 characters" });
        return;
      }

      const existing = await db.getUserByUsername(username);
      if (existing) {
        res.status(409).json({ error: "Username already taken" });
        return;
      }

      const passwordHash = await hashPassword(password);
      const user = await db.createUser({
        username,
        passwordHash,
        name: name || username,
      });

      const token = await signSession({
        userId: user.id,
        username: user.username,
        name: user.name ?? username,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        ok: true,
        user: { id: user.id, username: user.username, name: user.name },
      });
    } catch (err) {
      console.error("[Auth] Register failed", err);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body ?? {};

      if (!username || !password) {
        res.status(400).json({ error: "username and password are required" });
        return;
      }

      const user = await db.getUserByUsername(username);
      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) {
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      const token = await signSession({
        userId: user.id,
        username: user.username,
        name: user.name ?? username,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        ok: true,
        user: { id: user.id, username: user.username, name: user.name },
      });
    } catch (err) {
      console.error("[Auth] Login failed", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ ok: true });
  });
}
