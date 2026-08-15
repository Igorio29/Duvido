import Groq from "groq-sdk";
import type { GeneratedQuestion, GenerateQuestionOptions, Difficulty } from "../types/game.js";
import { ApiError } from "../utils/apiError.js";

export const GROQ_MODEL = "openai/gpt-oss-20b";
const MAX_ATTEMPTS = 3;
const difficulties: Difficulty[] = ["easy", "medium", "hard"];

const SYSTEM_PROMPT = `Você cria perguntas para DUVIDO!, um jogo competitivo de palpites numéricos para duas pessoas.
Retorne exclusivamente um objeto JSON válido com question, answer, category, difficulty e explanation.
Regras obrigatórias:
- Escreva em português do Brasil e faça uma pergunta compreensível sem contexto adicional.
- A resposta deve ser um número finito, não negativo e preferencialmente inteiro.
- Não inclua a resposta nem pistas óbvias dela na pergunta.
- Use fatos verificáveis e relativamente estáveis. Evite dados atuais, população atual, preços, valores financeiros, recordes voláteis e estimativas controversas.
- Evite subjetividade, ambiguidades, pegadinhas e números absurdamente grandes sem interesse lúdico.
- Prefira fatos históricos, científicos, geográficos, culturais, esportivos, tecnológicos e de entretenimento.
- A explicação deve ser curta, informativa e justificar claramente o número.
- Varie assunto e dificuldade. Não repita as perguntas recentes fornecidas.
- difficulty deve ser exatamente easy, medium ou hard.`;

function validate(value: unknown): GeneratedQuestion | null {
  if (!value || typeof value !== "object") return null;
  const q = value as Record<string, unknown>;
  if (typeof q.question !== "string" || !q.question.trim()) return null;
  if (typeof q.answer !== "number" || !Number.isFinite(q.answer) || q.answer < 0) return null;
  if (typeof q.category !== "string" || !q.category.trim()) return null;
  if (typeof q.explanation !== "string" || !q.explanation.trim()) return null;
  if (!difficulties.includes(q.difficulty as Difficulty)) return null;
  return {
    question: q.question.trim(), answer: q.answer, category: q.category.trim(),
    difficulty: q.difficulty as Difficulty, explanation: q.explanation.trim()
  };
}

export async function generateQuestion(options: GenerateQuestionOptions): Promise<GeneratedQuestion> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new ApiError(503, "A Groq API Key não está configurada. Copie .env.example para .env e preencha GROQ_API_KEY.");
  const groq = new Groq({ apiKey });
  const recent = options.recentQuestions.length
    ? options.recentQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")
    : "Nenhuma.";
  const request = `Categoria: ${options.category}\nDificuldade desejada: ${options.difficulty ?? "varie livremente"}\nTemas personalizados: ${options.customThemes || "nenhum"}\nPerguntas recentes que NÃO podem ser repetidas:\n${recent}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0.9,
        max_completion_tokens: 500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${request}\nTentativa ${attempt}: confira rigorosamente o formato e os fatos antes de responder.` }
        ]
      });
      const content = completion.choices[0]?.message?.content;
      if (!content) continue;
      const valid = validate(JSON.parse(content));
      if (valid) return valid;
    } catch (error) {
      console.error(`[Groq] tentativa ${attempt} falhou:`, error instanceof Error ? error.message : error);
    }
  }
  throw new ApiError(502, "Não conseguimos gerar uma pergunta agora. Tente novamente.");
}
