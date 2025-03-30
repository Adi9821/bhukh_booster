import OpenAI from "openai"

// Initialize OpenAI client with better error handling
export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not defined in environment variables")
  }

  return new OpenAI({
    apiKey,
  })
}

