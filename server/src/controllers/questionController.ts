import type { Request, Response, NextFunction } from "express";
import { generateQuestion } from "../services/groqService.js";
import { createRoundToken, readRoundToken } from "../services/roundToken.js";
import { ApiError } from "../utils/apiError.js";

const allowedCategories = ["Conhecimentos Gerais", "Games", "Filmes e Séries", "Ciência", "História", "Geografia", "Tecnologia", "Esportes", "Misturado", "Personalizado"];

export async function createQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, difficulty, customThemes, recentQuestions } = req.body ?? {};
    if (!allowedCategories.includes(category)) throw new ApiError(400, "Escolha uma categoria válida.");
    if (category === "Personalizado" && (typeof customThemes !== "string" || !customThemes.trim())) {
      throw new ApiError(400, "Informe ao menos um tema para o modo Personalizado.");
    }
    const recent = Array.isArray(recentQuestions)
      ? recentQuestions.filter((item): item is string => typeof item === "string").slice(-10)
      : [];
    const generated = await generateQuestion({ category, difficulty, customThemes: customThemes?.trim(), recentQuestions: recent });
    res.status(201).json({ roundId: createRoundToken(generated), question: generated.question, category: generated.category, difficulty: generated.difficulty });
  } catch (error) { next(error); }
}

export function revealQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const roundId = req.params.roundId;
    if (typeof roundId !== "string") throw new ApiError(400, "Identificador de rodada inválido.");
    const round = readRoundToken(roundId);
    const { lastGuess } = req.body ?? {};
    if (typeof lastGuess !== "number" || !Number.isFinite(lastGuess) || lastGuess < 0) throw new ApiError(400, "Envie um palpite numérico válido.");
    res.json({ answer: round.answer, explanation: round.explanation, lastGuess, challengeWasCorrect: lastGuess > round.answer });
  } catch (error) { next(error); }
}
