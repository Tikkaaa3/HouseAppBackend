import { Router } from "express";
import { prisma } from "../../config/prisma";
import {
  postCreateHouse,
  postJoinHouse,
  postLeaveHouse,
} from "./houses.controller";
import { requireAuth } from "../../middleware/auth";

const r = Router();

r.post("/", requireAuth, postCreateHouse);
r.post("/join", requireAuth, postJoinHouse);
r.post("/leave", requireAuth, postLeaveHouse);
// houses.routes.ts
r.get("/members", requireAuth, async (req, res) => {
  if (!req.user.houseId) return res.status(409).json({ error: "not_in_house" });
  const users = await prisma.user.findMany({
    where: { houseId: req.user.houseId },
    select: { id: true, displayName: true, email: true },
    orderBy: { displayName: "asc" },
  });
  res.json(users);
});

export default r;
