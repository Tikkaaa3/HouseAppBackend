import { Router } from "express";
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

export default r;
