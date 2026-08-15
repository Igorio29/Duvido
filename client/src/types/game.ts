export type Difficulty = "easy" | "medium" | "hard";
export type Screen = "home" | "loading" | "round" | "result" | "victory";
export interface Player { id: 0 | 1; name: string; lives: number; }
export interface PublicQuestion { roundId: string; question: string; category: string; difficulty: Difficulty; }
export interface Guess { playerId: 0 | 1; value: number; }
export interface Reveal { answer: number; explanation: string; lastGuess: number; challengeWasCorrect: boolean; }
export interface GameSettings { names: [string, string]; category: string; customThemes: string; }
