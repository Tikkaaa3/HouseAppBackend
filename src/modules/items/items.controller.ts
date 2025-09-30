import { Request, Response } from "express";
import { list, addItem, removeItem } from "./items.service";

export async function postAddItem(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const itemName = String(req.body.name).trim();
    const itemUnit = String(req.body.unit).trim();
    const itemCategory = String(req.body.category).trim();
    const itemTags = Array.isArray(req.body.tags) ? req.body.tags : [];
    const item = await addItem({
      houseId: req.user.houseId,
      name: itemName,
      category: itemCategory,
      unit: itemUnit,
      tags: itemTags,
    });
    res.status(201).json(item);
  } catch (e: any) {
    const msg = String(e.message);
    if (msg === "invalid_name") return res.status(400).json({ error: msg });
    if (msg === "invalid_category") return res.status(400).json({ error: msg });
    if (msg === "invalid_unit") return res.status(400).json({ error: msg });
    if (msg === "item_exists") return res.status(409).json({ error: msg });
    else return res.status(500).json({ error: "add_item_failed" });
  }
}

export async function getItemList(req: Request, res: Response) {
  if (!req.user.houseId) return res.status(409).json({ error: "not_in_house" });
  const houseId = req.user.houseId;
  const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
  const category =
    typeof req.query.category === "string"
      ? req.query.category.trim()
      : undefined;
  const archived = req.query.archived === "true";
  const items = await list({ houseId, q, category, archived });
  return res.status(200).json(items);
}

export async function deleteItem(req: Request, res: Response) {
  try {
    if (!req.user.houseId)
      return res.status(409).json({ error: "not_in_house" });
    const id = String(req.params.id).trim();
    if (!id) return res.status(400).json({ error: "invalid_id" });
    await removeItem({ houseId: req.user.houseId, id });
    res.sendStatus(204);
  } catch (e: any) {
    const msg = String(e.message);
    if (msg === "item_not_found") return res.status(404).json({ error: msg });
    else return res.status(500).json({ error: "remove_item_failed" });
  }
}
