import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  postCreateChore,
  getChores,
  postCompleteChore,
  postArchiveChore,
  patchReassignChore,
} from "./chores.controller";

const r = Router();

r.post("/chores", requireAuth, postCreateChore);
r.get("/chores", requireAuth, getChores);

r.post("/chores/:id/complete", requireAuth, postCompleteChore);
r.post("/chores/:id/archive", requireAuth, postArchiveChore);
r.patch("/chores/:id/reassign", requireAuth, patchReassignChore);

export default r;
