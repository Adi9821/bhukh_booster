"use server"

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY || "bf262b1355dd4617a4e3e4634593f8dc"
const API_BASE_URL = "https://api.spoonacular.com"

export interface RecipeSearchResult {
  id: number
  title: string
  image: string
  imageType: string
  usedIngredientCount: number
  missedIngredientCount: number
  missedIngredients: Ingredient[]
  usedIngredients: Ingredient[]
  unusedIngredients: Ingredient[]
  likes: number
}

export interface Ingredient {
  id: number
  amount: number
  unit: string
  unitLong: string
  unitShort: string
  aisle: string
  name: string
  original: string
  originalName: string
  meta: string[]
  image: string
}

export interface RecipeDetails {
  id: number
  title: string
  image: string
  imageType: string
  servings: number
  readyInMinutes: number
  license: string
  sourceName: string
  sourceUrl: string
  spoonacularSourceUrl: string
  aggregateLikes: number
  healthScore: number
  spoonacularScore: number
  pricePerServing: number
  analyzedInstructions: AnalyzedInstruction[]
  cheap: boolean
  creditsText: string
  cuisines: string[]
  dairyFree: boolean
  diets: string[]
  gaps: string
  glutenFree: boolean
  instructions: string
  ketogenic: boolean
  lowFodmap: boolean
  occasions: string[]
  sustainable: boolean
  vegan: boolean
  vegetarian: boolean
  veryHealthy: boolean
  veryPopular: boolean
  whole30: boolean
  weightWatcherSmartPoints: number
  dishTypes: string[]
  extendedIngredients: ExtendedIngredient[]
  summary: string
}

export interface AnalyzedInstruction {
  name: string
  steps: Step[]
}

export interface Step {
  number: number
  step: string
  ingredients: Ingredient[]
  equipment: Equipment[]
  length?: {
    number: number
    unit: string
  }
}

export interface Equipment {
  id: number
  name: string
  localizedName: string
  image: string
}

export interface ExtendedIngredient {
  id: number
  aisle: string
  image: string
  consistency: string
  name: string
  nameClean: string
  original: string
  originalName: string
  amount: number
  unit: string
  meta: string[]
  measures: {
    us: {
      amount: number
      unitShort: string
      unitLong: string
    }
    metric: {
      amount: number
      unitShort: string
      unitLong: string
    }
  }
}

// Helper function for API requests
async function fetchFromAPI<T>(url: string): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        error: `API error: ${response.status} ${errorText}`,
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { success: false, error: "Request timed out" }
      }
      return { success: false, error: error.message }
    }
    return { success: false, error: "Unknown error occurred" }
  }
}

export async function searchRecipesByIngredients(ingredients: string[]) {
  if (!ingredients.length) return { success: false, error: "No ingredients provided" }

  const ingredientsParam = ingredients.join(",")
  const url = `${API_BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsParam)}&number=12&ranking=2&ignorePantry=true&apiKey=${SPOONACULAR_API_KEY}`

  return await fetchFromAPI<RecipeSearchResult[]>(url)
}

export async function getRecipeDetails(recipeId: number) {
  const url = `${API_BASE_URL}/recipes/${recipeId}/information?includeNutrition=false&apiKey=${SPOONACULAR_API_KEY}`
  return await fetchFromAPI<RecipeDetails>(url)
}

// New function to search recipes by query
export async function searchRecipesByQuery(query: string) {
  if (!query.trim()) return { success: false, error: "No search query provided" }

  const url = `${API_BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&apiKey=${SPOONACULAR_API_KEY}`

  return await fetchFromAPI<{ results: any[] }>(url)
}

// New function to get random recipes
export async function getRandomRecipes(tags?: string) {
  const tagsParam = tags ? `&tags=${encodeURIComponent(tags)}` : ""
  const url = `${API_BASE_URL}/recipes/random?number=6${tagsParam}&apiKey=${SPOONACULAR_API_KEY}`

  return await fetchFromAPI<{ recipes: any[] }>(url)
}

