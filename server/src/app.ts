import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import { questionRoutes } from "./routes/questionRoutes.js";
import { ApiError } from "./utils/apiError.js";

export const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "20kb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/questions", questionRoutes);
app.use((_req, res) => res.status(404).json({ message: "Rota não encontrada." }));
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof ApiError ? error.publicMessage : "Algo deu errado no servidor. Tente novamente.";
  if (!(error instanceof ApiError)) console.error(error);
  res.status(status).json({ message });
};
app.use(errorHandler);
