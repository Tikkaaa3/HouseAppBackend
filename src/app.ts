import express from "express";
import { Request, Response } from "express";
import authRoutes from "./modules/auth/auth.routes";
import houseRoutes from "./modules/houses/houses.routes";
import itemRoutes from "./modules/items/items.routes";

const app = express();
app.use(express.json());

app.get("/health", (req: Request, res: Response) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/houses", houseRoutes);
app.use("/items", itemRoutes);

export default app;
