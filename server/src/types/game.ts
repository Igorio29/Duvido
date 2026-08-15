export type Difficulty = "easy" | "medium" | "hard";

export interface GeneratedQuestion {
  question: string;
  answer: number;
  category: string;
  difficulty: Difficulty;
  explanation: string;
}

export interface GenerateQuestionOptions {
  category: string;
  difficulty?: Difficulty;
  customThemes?: string;
  recentQuestions: string[];
}

export interface StoredRound extends GeneratedQuestion {
  id: string;
  createdAt: number;
  revealed: boolean;
}
