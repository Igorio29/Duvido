import { useState } from "react";
import { createQuestion, revealQuestion } from "../services/api";
import type { GameSettings, Guess, Player, PublicQuestion, Reveal, Screen } from "../types/game";

export function useGame() {
  const [screen, setScreen] = useState<Screen>("home");
  const [players, setPlayers] = useState<[Player, Player]>([{ id: 0, name: "", lives: 3 }, { id: 1, name: "", lives: 3 }]);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [turn, setTurn] = useState<0 | 1>(0);
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [loserId, setLoserId] = useState<0 | 1 | null>(null);
  const [error, setError] = useState("");
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);

  async function loadRound(gameSettings: GameSettings, number: number) {
    setScreen("loading"); setError(""); setQuestion(null); setGuesses([]); setReveal(null); setLoserId(null);
    setTurn(((number - 1) % 2) as 0 | 1);
    try {
      const generated = await createQuestion(gameSettings.category, gameSettings.customThemes, recentQuestions);
      setQuestion(generated); setRecentQuestions(current => [...current, generated.question].slice(-10)); setScreen("round");
    }
    catch (e) { setError(e instanceof Error ? e.message : "Falha inesperada."); }
  }
  function start(next: GameSettings) {
    setSettings(next); setPlayers([{ id: 0, name: next.names[0], lives: 3 }, { id: 1, name: next.names[1], lives: 3 }]);
    setRecentQuestions([]); setRoundNumber(1); void loadRound(next, 1);
  }
  function guess(value: number) { setGuesses(g => [...g, { playerId: turn, value }]); setTurn(turn === 0 ? 1 : 0); }
  async function challenge() {
    const last = guesses.at(-1); if (!question || !last) return;
    setError("");
    try {
      const result = await revealQuestion(question.roundId, last.value);
      const loser: 0 | 1 = result.challengeWasCorrect ? last.playerId : turn;
      setReveal(result); setLoserId(loser);
      setPlayers(current => current.map(p => p.id === loser ? { ...p, lives: p.lives - 1 } : p) as [Player, Player]);
      setScreen("result");
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível revelar a resposta."); }
  }
  function nextRound() {
    const loser = loserId === null ? null : players[loserId];
    if (loser?.lives === 0) setScreen("victory");
    else if (settings) { const next = roundNumber + 1; setRoundNumber(next); void loadRound(settings, next); }
  }
  function reset() { setScreen("home"); setError(""); setSettings(null); }
  return { screen, players, settings, roundNumber, turn, question, guesses, reveal, loserId, error, start, guess, challenge, nextRound, retry: () => settings && loadRound(settings, roundNumber), reset };
}
