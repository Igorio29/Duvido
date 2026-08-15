export type Difficulty = "easy" | "medium" | "hard";
export type Screen = "home" | "loading" | "round" | "result" | "victory";
export interface Player { id: number; name: string; lives: number; }
export interface PublicQuestion { roundId: string; question: string; category: string; difficulty: Difficulty; }
export interface Guess { playerId: number; value: number; }
export interface Reveal { answer: number; explanation: string; lastGuess: number; challengeWasCorrect: boolean; }
export interface GameSettings { names: string[]; category: string; customThemes: string; }
