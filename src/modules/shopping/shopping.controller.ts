import { Request, Response } from "express";
import {
  addLine,
  createList,
  getList,
  removeLine,
  archiveList,
  listLists,
} from "./shopping.service";

export async function postCreateList(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const title =
      typeof req.body.title === "string" ? req.body.title.trim() : "";
    const list = await createList({ houseId: req.user.houseId, title });
    return res.status(201).json(list);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "invalid_title") return res.status(400).json({ error: m });
    if (m === "list_exists") return res.status(409).json({ error: m });
    return res.status(500).json({ error: "create_list_failed" });
  }
}

export async function postAddLine(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const listId = String(req.params.id || "").trim();
    if (!listId) return res.status(400).json({ error: "invalid_list_id" });

    const itemId =
      typeof req.body.itemId === "string" ? req.body.itemId.trim() : "";
    const quantity = req.body.quantity;
    const unitOverride =
      typeof req.body.unitOverride === "string"
        ? req.body.unitOverride.trim()
        : undefined;
    const note =
      typeof req.body.note === "string" ? req.body.note.trim() : undefined;

    const line = await addLine({
      houseId: req.user.houseId,
      listId,
      itemId,
      quantity,
      unitOverride,
      note,
    });

    return res.status(201).json(line);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "invalid_quantity" || m === "invalid_list_id")
      return res.status(400).json({ error: m });
    if (m === "list_not_found" || m === "item_not_found")
      return res.status(404).json({ error: m });
    if (m === "list_archived") return res.status(409).json({ error: m });
    return res.status(500).json({ error: "add_line_failed" });
  }
}

export async function getShoppingListsIndex(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const archived = req.query.archived === "true";
    const lists = await listLists({ houseId: req.user.houseId, archived });
    return res.status(200).json(lists);
  } catch {
    return res.status(500).json({ error: "list_shopping_lists_failed" });
  }
}

export async function getListById(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const listId = String(req.params.id || "").trim();
    if (!listId) return res.status(400).json({ error: "invalid_list_id" });

    const list = await getList({ houseId: req.user.houseId, listId });
    return res.status(200).json(list);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "list_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "get_list_failed" });
  }
}

export async function deleteLine(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const listId = String(req.params.listId || "").trim();
    const lineId = String(req.params.lineId || "").trim();
    if (!listId || !lineId)
      return res.status(400).json({ error: "invalid_id" });

    await removeLine({ houseId: req.user.houseId, listId, lineId });
    return res.sendStatus(204);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "line_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "remove_line_failed" });
  }
}

export async function postArchiveList(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const listId = String(req.params.listId || "").trim();
    if (!listId) return res.status(400).json({ error: "invalid_list_id" });

    await archiveList({ houseId: req.user.houseId, listId });
    return res.sendStatus(204);
  } catch (e: any) {
    const m = String(e.message);
    if (m === "list_not_found") return res.status(404).json({ error: m });
    return res.status(500).json({ error: "archive_list_failed" });
  }
}
