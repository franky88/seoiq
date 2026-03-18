import Groq from "groq-sdk"

if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY environment variable")
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export const AVAILABLE_MODELS = {
  "llama-3.3-70b-versatile": "Llama 3.3 70B (Recommended)",
  "llama-3.1-8b-instant": "Llama 3.1 8B (Fast)",
  "openai/gpt-oss-120b": "GPT-OSS 120B",
  "meta-llama/llama-4-scout-17b-16e-instruct": "Llama 4 Scout 17B (Latest)",
} as const

export type ModelId = keyof typeof AVAILABLE_MODELS

export const DEFAULT_MODEL: ModelId = "llama-3.3-70b-versatile"

export function isValidModel(model: string): model is ModelId {
  return model in AVAILABLE_MODELS
}
