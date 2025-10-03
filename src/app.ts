import express from "express";
import { Request, Response } from "express";
import authRoutes from "./modules/auth/auth.routes";
import houseRoutes from "./modules/houses/houses.routes";
import itemRoutes from "./modules/items/items.routes";
import shoppingRoutes from "./modules/shopping/shopping.routes";
import choreRoutes from "./modules/chores/chores.routes";
import recipeRoutes from "./modules/recipes/recipes.routes";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (req: Request, res: Response) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/houses", houseRoutes);
app.use("/items", itemRoutes);
app.use("/", shoppingRoutes);
app.use("/", choreRoutes);
app.use("/", recipeRoutes);

export default app;
