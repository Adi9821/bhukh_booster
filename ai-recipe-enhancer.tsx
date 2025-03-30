"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, ChefHat, Wine, Apple } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { RecipeDetails } from "@/app/actions/recipe-actions"

interface AIRecipeEnhancerProps {
  recipe: RecipeDetails
}

interface RecipeEnhancement {
  tips: string[]
  variations: string[]
  pairings: string[]
  nutritionalBenefits: string[]
}

export default function AIRecipeEnhancer({ recipe }: AIRecipeEnhancerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [enhancement, setEnhancement] = useState<RecipeEnhancement | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getEnhancement = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const ingredients = recipe.extendedIngredients.map((ing) => `${ing.amount} ${ing.unit} ${ing.name}`)
      const instructions =
        recipe.instructions || recipe.analyzedInstructions?.[0]?.steps.map((s) => s.step).join("\n") || ""

      const response = await fetch("/api/ai/recipe-enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeName: recipe.title,
          ingredients,
          instructions,
        }),
      })

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} ${errorText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setEnhancement(result.data)
      } else {
        setError(result.error || "Failed to enhance recipe")
      }
    } catch (err) {
      console.error("Error in getEnhancement:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!enhancement && !isLoading && !error) {
    return (
      <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Recipe Enhancement
          </CardTitle>
          <CardDescription>Get cooking tips, variations, and more for this recipe</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={getEnhancement}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Enhance This Recipe
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI Recipe Enhancement
        </CardTitle>
        <CardDescription>AI-powered tips and variations for this recipe</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
              <p className="mt-2 text-sm text-blue-800">Enhancing your recipe...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : enhancement ? (
          <Tabs defaultValue="tips" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="tips">
                <ChefHat className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Tips</span>
              </TabsTrigger>
              <TabsTrigger value="variations">
                <span className="hidden md:inline">Variations</span>
              </TabsTrigger>
              <TabsTrigger value="pairings">
                <Wine className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Pairings</span>
              </TabsTrigger>
              <TabsTrigger value="nutrition">
                <Apple className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Nutrition</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tips" className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="font-medium text-blue-800 mb-2">Cooking Tips</h3>
              <ul className="space-y-2">
                {enhancement.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="variations" className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="font-medium text-blue-800 mb-2">Recipe Variations</h3>
              <ul className="space-y-2">
                {enhancement.variations.map((variation, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{variation}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="pairings" className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="font-medium text-blue-800 mb-2">Beverage Pairings</h3>
              <ul className="space-y-2">
                {enhancement.pairings.map((pairing, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{pairing}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="nutrition" className="bg-white rounded-md p-4 shadow-sm">
              <h3 className="font-medium text-blue-800 mb-2">Nutritional Benefits</h3>
              <ul className="space-y-2">
                {enhancement.nutritionalBenefits.map((benefit, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        ) : null}
      </CardContent>

      {enhancement && (
        <CardFooter>
          <Button onClick={getEnhancement} variant="outline" className="w-full" disabled={isLoading}>
            <Sparkles className="h-4 w-4 mr-2" />
            Regenerate Enhancement
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

