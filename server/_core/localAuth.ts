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

  // GET /api/auth/authhub/config
  app.get("/api/auth/authhub/config", (_req: Request, res: Response) => {
    const authhubUrl = process.env.AUTHHUB_URL || "https://auth.josapratama.com";
    const clientId = process.env.AUTHHUB_CLIENT_ID || "ah_client_resumecraft_4c2d1e";
    res.json({
      enabled: true,
      authhub_url: authhubUrl.replace(/\/+$/, ""),
      client_id: clientId,
    });
  });

  // POST /api/auth/authhub/callback
  app.post("/api/auth/authhub/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.body ?? {};
      if (!code || typeof code !== "string") {
        res.status(400).json({ error: "Kode otorisasi dari AuthHub tidak ditemukan." });
        return;
      }

      const authhubUrl = (process.env.AUTHHUB_URL || "https://auth.josapratama.com").replace(/\/+$/, "");
      const clientId = process.env.AUTHHUB_CLIENT_ID || "ah_client_resumecraft_4c2d1e";
      const clientSecret = process.env.AUTHHUB_CLIENT_SECRET || "ah_secret_resumecraft_7b9a8f2e4d6c1a5b3e";

      const tokenResp = await fetch(`${authhubUrl}/api/v1/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grantType: "authorization_code",
          code,
          clientId,
          clientSecret,
        }),
      });

      const tokenData = await tokenResp.json().catch(() => null);

      if (!tokenResp.ok || !tokenData) {
        const rawErr = tokenData?.error || "Otorisasi token gagal";
        let friendlyErr = rawErr;
        if (rawErr.includes("Invalid, expired, or already used authorization_code")) {
          friendlyErr = "Kode otorisasi dari AuthHub telah kedaluwarsa atau sudah digunakan. Silakan coba login kembali.";
        } else if (rawErr.includes("Invalid client_id or client_secret")) {
          friendlyErr = "Kredensial client AuthHub SSO tidak valid.";
        }
        res.status(401).json({ error: friendlyErr });
        return;
      }

      const authUser = tokenData.user || {};
      const rawUsername = authUser.username || (authUser.email ? authUser.email.split("@")[0] : null) || `user_${authUser.id?.slice(0, 8) || "sso"}`;
      const cleanUsername = rawUsername.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50).toLowerCase();

      const isAdmin = authUser.globalRole === "superadmin" || authUser.appRole === "superadmin" || authUser.appRole === "admin";

      const localUser = await db.upsertAuthHubUser({
        authHubId: authUser.id || `ah_${cleanUsername}`,
        email: authUser.email,
        username: cleanUsername,
        name: authUser.name || cleanUsername,
        role: isAdmin ? "admin" : "user",
      });

      const token = await signSession({
        userId: localUser.id,
        username: localUser.username,
        name: localUser.name ?? localUser.username,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({
        ok: true,
        user: { id: localUser.id, username: localUser.username, name: localUser.name },
      });
    } catch (err: any) {
      console.error("[Auth] AuthHub SSO callback failed:", err);
      res.status(500).json({ error: err.message || "Gagal mengautentikasi dengan AuthHub SSO" });
    }
  });
}
