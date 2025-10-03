import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { login, signup } from "./auth.service";

export async function postSignup(req: Request, res: Response) {
  try {
    const { email, password, displayName } = req.body ?? {};
    const result = await signup({ email, password, displayName });
    return res.status(201).json(result);
  } catch (err: any) {
    const msg = String(err?.message ?? "signup_failed");
    const status =
      msg.includes("already in use") || msg.includes("Password too short")
        ? 400
        : 500;
    return res.status(status).json({ error: msg });
  }
}

export async function postLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};
    const result = await login({ email, password });
    return res.status(200).json(result);
  } catch (err: any) {
    const msg = String(err?.message ?? "login_failed");
    const status = msg.includes("Invalid credentials") ? 401 : 500;
    return res.status(status).json({ error: msg });
  }
}

// export async function getMe(req: Request, res: Response) {
//   if (!req.user) return res.status(401).json({ error: "unauthorized" });
//   // minimal: return the JWT payload copy; later you can fetch fresh user by id if you want
//   return res.json({ user: req.user });
// }

export async function getMe(req: Request, res: Response) {
  try {
    const u = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        houseId: true,
        house: { select: { id: true, name: true } },
      },
    });

    if (!u) return res.status(404).json({ error: "user_not_found" });

    return res.status(200).json({
      user: {
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        houseId: u.houseId,
      },
      house: u.house ? { id: u.house.id, name: u.house.name } : null,
    });
  } catch (e) {
    return res.status(500).json({ error: "get_me_failed" });
  }
}
