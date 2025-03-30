"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AIRecipeIdeasProps {
  ingredients: string[]
}

interface RecipeIdea {
  name: string
  description: string
  additionalIngredients: string[]
}

export default function AIRecipeIdeas({ ingredients }: AIRecipeIdeasProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [recipeIdeas, setRecipeIdeas] = useState<RecipeIdea[]>([])
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  const getRecipeIdeas = async () => {
    if (ingredients.length === 0) {
      setError("Please add some ingredients first")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use a simpler approach with explicit error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/ai/recipe-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Get response as text first
      const responseText = await response.text()

      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse API response:", responseText)
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`)
      }

      if (!response.ok) {
        throw new Error(result.error || `API error: ${response.status}`)
      }

      if (result.success && result.data && result.data.recipes) {
        setRecipeIdeas(result.data.recipes)
      } else {
        throw new Error(result.error || "Failed to generate recipe ideas")
      }
    } catch (err) {
      console.error("Error in getRecipeIdeas:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Mock data for testing - uncomment to test UI without API
  /*
  const mockRecipeIdeas = () => {
    setIsLoading(true);
    setTimeout(() => {
      setRecipeIdeas([
        {
          name: "Pasta Primavera",
          description: "A light and fresh pasta dish with seasonal vegetables.",
          additionalIngredients: ["parmesan cheese", "fresh herbs", "lemon"]
        },
        {
          name: "Vegetable Stir Fry",
          description: "Quick and healthy stir fry with your favorite vegetables.",
          additionalIngredients: ["soy sauce", "ginger", "garlic"]
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };
  */

  if (recipeIdeas.length === 0 && !isLoading && !error) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            AI Recipe Suggestions
          </CardTitle>
          <CardDescription>Get creative recipe ideas based on your ingredients</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={getRecipeIdeas}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            disabled={ingredients.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Recipe Ideas
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            AI Recipe Suggestions
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>Creative ideas based on your ingredients</CardDescription>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-400 border-t-transparent"></div>
                <p className="mt-2 text-sm text-orange-800">Generating creative recipes...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {recipeIdeas.map((idea, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium text-orange-800">{idea.name}</h3>
                  <p className="text-sm text-slate-600 mt-1 mb-2">{idea.description}</p>
                  {idea.additionalIngredients && idea.additionalIngredients.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Additional ingredients needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {idea.additionalIngredients.map((ingredient, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-amber-50">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}

      <CardFooter>
        <Button
          onClick={getRecipeIdeas}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Generating...
            </span>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {recipeIdeas.length > 0 ? "Regenerate Ideas" : "Generate Recipe Ideas"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

