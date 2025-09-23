import { Request, Response } from "express";
import { createHouse, joinHouse, leaveHouse } from "./houses.service";

export async function postCreateHouse(req: Request, res: Response) {
  try {
    const houseName = String(req.body.name).trim();
    const house = await createHouse({ userId: req.user.id, name: houseName });
    res.status(201).json(house);
  } catch (e: any) {
    const msg = String(e.message);
    if (msg === "invalid_name") return res.status(400).json({ error: msg });
    if (msg === "user_not_found") return res.status(404).json({ error: msg });
    if (msg === "already_in_house") return res.status(409).json({ error: msg });
    else return res.status(500).json({ error: "create_house_failed" });
  }
}

export async function postJoinHouse(req: Request, res: Response) {
  try {
    const houseId = String(req.body.houseId).trim();
    if (!houseId) return res.status(400).json({ error: "invalid_house_id" });
    await joinHouse({ userId: req.user.id, houseId });
    return res.status(200).json({ houseId });
  } catch (e: any) {
    const msg = String(e.message);
    if (msg === "invalid_house_id") return res.status(400).json({ error: msg });
    if (msg === "user_not_found") return res.status(404).json({ error: msg });
    if (msg === "house_not_found") return res.status(404).json({ error: msg });
    if (msg === "already_in_house") return res.status(409).json({ error: msg });
    else return res.status(500).json({ error: "join_house_failed" });
  }
}

export async function postLeaveHouse(req: Request, res: Response) {
  try {
    await leaveHouse({ userId: req.user.id });
    return res.sendStatus(204);
  } catch (e: any) {
    const msg = String(e.message);
    if (msg === "user_not_found") return res.status(404).json({ error: msg });
    else return res.status(500).json({ error: "leave_house_failed" });
  }
}
