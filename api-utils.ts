import { NextResponse } from "next/server"

export function errorResponse(error: unknown, status = 500) {
  console.error("API Error:", error)

  return NextResponse.json(
    {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    },
    { status },
  )
}

