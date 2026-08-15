import { Router } from "express";
import { createQuestion, revealQuestion } from "../controllers/questionController.js";
export const questionRoutes = Router();
questionRoutes.post("/", createQuestion);
questionRoutes.post("/:roundId/reveal", revealQuestion);
