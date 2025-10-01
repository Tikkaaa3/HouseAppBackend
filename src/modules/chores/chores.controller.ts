import { Request, Response } from "express";
import { ChoreFrequency } from "@prisma/client";
import {
  createChore,
  listChores,
  completeChore,
  archiveChore,
  reassignChore,
} from "./chores.service";

export async function postCreateChore(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const frequency = req.body.frequency as ChoreFrequency;
    const assignedToId =
      typeof req.body.assignedToId === "string" ? req.body.assignedToId : null;

    const chore = await createChore({
      houseId: req.user.houseId,
      title,
      frequency,
      assignedToId,
    });

    return res.status(201).json(chore);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "invalid_title") return res.status(400).json({ error: m });
    if (m === "assignee_invalid") return res.status(400).json({ error: m });
    return res.status(500).json({ error: "create_chore_failed" });
  }
}

export async function getChores(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const archived = req.query.archived === "true";

    const chores = await listChores({
      houseId: req.user.houseId,
      archived,
    });
    return res.status(200).json(chores);
  } catch {
    return res.status(500).json({ error: "list_chores_failed" });
  }
}

export async function postCompleteChore(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const choreId = String(req.params.id || "").trim();
    if (!choreId) return res.status(400).json({ error: "invalid_chore_id" });

    const note =
      typeof req.body.note === "string" ? req.body.note.trim() : undefined;

    const completion = await completeChore({
      houseId: req.user.houseId,
      choreId,
      userId: req.user.id,
      note,
    });

    return res.status(201).json(completion);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "chore_not_found") return res.status(404).json({ error: m });
    if (m === "chore_archived") return res.status(409).json({ error: m });
    return res.status(500).json({ error: "complete_chore_failed" });
  }
}

export async function postArchiveChore(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const choreId = String(req.params.id || "").trim();
    if (!choreId) return res.status(400).json({ error: "invalid_chore_id" });

    await archiveChore({ houseId: req.user.houseId, choreId });
    return res.sendStatus(204);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "chore_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "archive_chore_failed" });
  }
}

export async function patchReassignChore(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });

    const choreId = String(req.params.id || "").trim();
    if (!choreId) return res.status(400).json({ error: "invalid_chore_id" });

    const assignedToId =
      typeof req.body.assignedToId === "string" ? req.body.assignedToId : null;

    const chore = await reassignChore({
      houseId: req.user.houseId,
      choreId,
      assignedToId,
    });

    return res.status(200).json(chore);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "chore_not_found") return res.status(404).json({ error: m });
    if (m === "assignee_invalid") return res.status(400).json({ error: m });
    return res.status(500).json({ error: "reassign_chore_failed" });
  }
}
