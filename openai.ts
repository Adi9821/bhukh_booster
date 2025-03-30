// This file is only imported on the server side
import OpenAI from "openai"

// We check if we're on the server before initializing
const isServer = typeof window === "undefined"

// Only create the client on the server
export const openai = isServer
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,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
    })
  : null

// Helper function to ensure we're on the server
export function ensureServerSide() {
  if (!isServer) {
    throw new Error("This function can only be called on the server side")
  }
}

