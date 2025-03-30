import { NextResponse } from "next/server"

export async function GET() {
  // Don't expose the actual API keys, just check if they exist
  const envStatus = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Set" : "Not set",
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY ? "Set" : "Not set",
    NODE_ENV: process.env.NODE_ENV,
  }

  return NextResponse.json({ status: "ok", environment: envStatus })
}

