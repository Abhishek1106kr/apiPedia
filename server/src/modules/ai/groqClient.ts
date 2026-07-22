const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export interface GroqChatMessage {
  role: "system" | "user";
  content: string;
}

// Groq exposes an OpenAI-compatible chat completions API, so a plain fetch
// against their endpoint is enough — no SDK needed for one call shape.
export async function callGroq(messages: GroqChatMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API returned ${response.status}: ${errorBody}`);
  }

  const body = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  return body.choices[0]?.message.content ?? "";
}
