import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../modules/auth/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyJwt<{
      sub: string;
      email: string;
      houseId: string | null;
    }>(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      houseId: payload.houseId,
    };
    return next();
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}
