import type { GeneratedQuestion, StoredRound } from "../types/game.js";

const rounds = new Map<string, StoredRound>();
const recentQuestions: string[] = [];
const MAX_RECENT = 10;
const ROUND_TTL = 2 * 60 * 60 * 1000;

export function saveRound(question: GeneratedQuestion): StoredRound {
  cleanup();
  const round = { ...question, id: crypto.randomUUID(), createdAt: Date.now(), revealed: false };
  rounds.set(round.id, round);
  recentQuestions.unshift(question.question);
  recentQuestions.splice(MAX_RECENT);
  return round;
}

export const findRound = (id: string) => rounds.get(id);
export const getRecentQuestions = () => [...recentQuestions];

function cleanup() {
  const cutoff = Date.now() - ROUND_TTL;
  for (const [id, round] of rounds) if (round.createdAt < cutoff) rounds.delete(id);
}
