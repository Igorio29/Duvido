import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { GeneratedQuestion } from "../types/game.js";
import { ApiError } from "../utils/apiError.js";

interface RoundPayload {
  answer: number;
  explanation: string;
  expiresAt: number;
}

function encryptionKey() {
  const secret = process.env.GROQ_API_KEY;
  if (!secret) throw new ApiError(503, "A Groq API Key não está configurada. Copie .env.example para .env e preencha GROQ_API_KEY.");
  return createHash("sha256").update(`duvido-round:${secret}`).digest();
}

export function createRoundToken(question: GeneratedQuestion) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const payload: RoundPayload = { answer: question.answer, explanation: question.explanation, expiresAt: Date.now() + 2 * 60 * 60 * 1000 };
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function readRoundToken(token: string): RoundPayload {
  try {
    const data = Buffer.from(token, "base64url");
    if (data.length < 29) throw new Error("invalid token");
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), data.subarray(0, 12));
    decipher.setAuthTag(data.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8")) as RoundPayload;
    if (!Number.isFinite(payload.answer) || !payload.explanation || payload.expiresAt < Date.now()) throw new Error("expired token");
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(404, "Rodada não encontrada ou expirada. Comece uma nova rodada.");
  }
}
