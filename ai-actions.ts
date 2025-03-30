"use server"

import { openai, ensureServerSide } from "../lib/openai"

// Function to generate recipe ideas based on ingredients
export async function generateRecipeIdeas(ingredients: string[]) {
  try {
    // Ensure we're on the server
    ensureServerSide()

    if (!ingredients.length) {
      return { success: false, error: "No ingredients provided" }
    }

    if (!openai) {
      return { success: false, error: "OpenAI client not available on the server" }
    }

    const prompt = `
      I have the following ingredients: ${ingredients.join(", ")}.
      Suggest 3 creative recipe ideas I could make with these ingredients.
      For each recipe, provide:
      1. A catchy name
      2. A brief description (1-2 sentences)
      3. Any additional ingredients I might need
      
      Format your response as JSON with this structure:
      {
        "recipes": [
          {
            "name": "Recipe Name",
            "description": "Brief description",
            "additionalIngredients": ["ingredient1", "ingredient2"]
          }
        ]
      }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful cooking assistant that provides recipe ideas in JSON format." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    })

    const text = response.choices[0].message.content || ""

    try {
      const parsedResponse = JSON.parse(text)
      return { success: true, data: parsedResponse }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return { success: false, error: "Failed to parse AI response" }
    }
  } catch (error) {
    console.error("Error generating recipe ideas:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Function to enhance a recipe with AI
export async function enhanceRecipe(recipeName: string, ingredients: string[], instructions: string) {
  try {
    // Ensure we're on the server
    ensureServerSide()

    if (!openai) {
      return { success: false, error: "OpenAI client not available on the server" }
    }

    const prompt = `
      I have a recipe for "${recipeName}" with these ingredients:
      ${ingredients.join(", ")}
      
      And these instructions:
      ${instructions}
      
      Please enhance this recipe by providing:
      1. Cooking tips and tricks
      2. Possible variations (e.g., vegetarian, spicy, etc.)
      3. Wine or beverage pairing suggestions
      4. Nutritional benefits
      
      Format your response as JSON with this structure:
      {
        "tips": ["tip1", "tip2"],
        "variations": ["variation1", "variation2"],
        "pairings": ["pairing1", "pairing2"],
        "nutritionalBenefits": ["benefit1", "benefit2"]
      }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful cooking assistant that provides recipe enhancements in JSON format.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    })

    const text = response.choices[0].message.content || ""

    try {
      const parsedResponse = JSON.parse(text)
      return { success: true, data: parsedResponse }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return { success: false, error: "Failed to parse AI response" }
    }
  } catch (error) {
    console.error("Error enhancing recipe:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Function to generate a weekly meal plan
export async function generateMealPlan(preferences: string, restrictions: string) {
  try {
    // Ensure we're on the server
    ensureServerSide()

    if (!openai) {
      return { success: false, error: "OpenAI client not available on the server" }
    }

    const prompt = `
      Create a 7-day meal plan with the following preferences: ${preferences || "balanced diet"}.
      Dietary restrictions to consider: ${restrictions || "none"}.
      
      For each day, include breakfast, lunch, and dinner.
      
      Format your response as JSON with this structure:
      {
        "mealPlan": [
          {
            "day": "Monday",
            "breakfast": "Meal description",
            "lunch": "Meal description",
            "dinner": "Meal description"
          }
        ]
      }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful meal planning assistant that provides meal plans in JSON format.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    })

    const text = response.choices[0].message.content || ""

    try {
      const parsedResponse = JSON.parse(text)
      return { success: true, data: parsedResponse }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return { success: false, error: "Failed to parse AI response" }
    }
  } catch (error) {
    console.error("Error generating meal plan:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

