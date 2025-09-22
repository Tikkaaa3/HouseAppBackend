import express from "express";
import authRoutes from "./modules/auth/auth.routes";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);

// TEMP debug
console.log(
  "Routes mounted: POST /auth/signup, POST /auth/login, GET /auth/me",
);
export default app;
