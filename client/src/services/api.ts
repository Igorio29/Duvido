import type { Difficulty, PublicQuestion, Reveal } from "../types/game";
const parse = async <T,>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || "Não foi possível falar com o servidor.");
  return body as T;
};
export async function createQuestion(category: string, customThemes: string, recentQuestions: string[], difficulty?: Difficulty) {
  return parse<PublicQuestion>(await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category, customThemes, recentQuestions, difficulty }) }));
}
export async function revealQuestion(roundId: string, lastGuess: number) {
  return parse<Reveal>(await fetch(`/api/questions/${roundId}/reveal`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lastGuess }) }));
}
