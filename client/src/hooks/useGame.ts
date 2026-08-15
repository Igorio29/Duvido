import { useState } from "react";
import { createQuestion, revealQuestion } from "../services/api";
import type { GameSettings, Guess, Player, PublicQuestion, Reveal, Screen } from "../types/game";

export function useGame() {
  const [screen, setScreen] = useState<Screen>("home");
  const [players, setPlayers] = useState<Player[]>([]);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [turn, setTurn] = useState(0);
  const [question, setQuestion] = useState<PublicQuestion | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [loserId, setLoserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);

  function nextActivePlayer(currentId: number, roster: Player[]) {
    for (let step = 1; step <= roster.length; step++) {
      const candidate = roster[(currentId + step) % roster.length];
      if (candidate?.lives) return candidate.id;
    }
    return currentId;
  }
  async function loadRound(gameSettings: GameSettings, number: number, roster = players) {
    setScreen("loading"); setError(""); setQuestion(null); setGuesses([]); setReveal(null); setLoserId(null);
    const active = roster.filter(player => player.lives > 0);
    setTurn(active[(number - 1) % active.length]?.id ?? 0);
    try {
      const generated = await createQuestion(gameSettings.category, gameSettings.customThemes, recentQuestions);
      setQuestion(generated); setRecentQuestions(current => [...current, generated.question].slice(-10)); setScreen("round");
    }
    catch (e) { setError(e instanceof Error ? e.message : "Falha inesperada."); }
  }
  function start(next: GameSettings) {
    const roster = next.names.map((name, id) => ({ id, name, lives: 3 }));
    setSettings(next); setPlayers(roster);
    setRecentQuestions([]); setRoundNumber(1); void loadRound(next, 1, roster);
  }
  function guess(value: number) { setGuesses(g => [...g, { playerId: turn, value }]); setTurn(nextActivePlayer(turn, players)); }
  async function challenge() {
    const last = guesses.at(-1); if (!question || !last) return;
    setError("");
    try {
      const result = await revealQuestion(question.roundId, last.value);
      const loser = result.challengeWasCorrect ? last.playerId : turn;
      setReveal(result); setLoserId(loser);
      setPlayers(current => current.map(p => p.id === loser ? { ...p, lives: Math.max(0, p.lives - 1) } : p));
      setScreen("result");
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível revelar a resposta."); }
  }
  function nextRound() {
    const active = players.filter(player => player.lives > 0);
    if (active.length === 1) setScreen("victory");
    else if (settings) { const next = roundNumber + 1; setRoundNumber(next); void loadRound(settings, next); }
  }
  function reset() { setScreen("home"); setError(""); setSettings(null); }
  return { screen, players, settings, roundNumber, turn, question, guesses, reveal, loserId, error, start, guess, challenge, nextRound, retry: () => settings && loadRound(settings, roundNumber), reset };
}
