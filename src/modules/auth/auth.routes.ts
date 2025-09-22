import { Router } from "express";
import { postLogin, postSignup, getMe } from "./auth.controller";
import { requireAuth } from "../../middleware/auth";

const r = Router();

r.post("/signup", postSignup);
r.post("/login", postLogin);
r.get("/me", requireAuth, getMe);

export default r;
