"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface MealDay {
  day: string
  breakfast: string
  lunch: string
  dinner: string
}

export default function AIMealPlanner() {
  const [isLoading, setIsLoading] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealDay[]>([])
  const [error, setError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState("")
  const [restrictions, setRestrictions] = useState("")

  const getMealPlan = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences, restrictions }),
      })

      // Check if the response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API error: ${response.status} ${errorText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setMealPlan(result.data.mealPlan)
      } else {
        setError(result.error || "Failed to generate meal plan")
      }
    } catch (err) {
      console.error("Error in getMealPlan:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          AI Meal Planner
        </CardTitle>
        <CardDescription>Generate a personalized weekly meal plan</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferences">Preferences (optional)</Label>
          <Input
            id="preferences"
            placeholder="e.g., high protein, Mediterranean, budget-friendly"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restrictions">Dietary Restrictions (optional)</Label>
          <Input
            id="restrictions"
            placeholder="e.g., gluten-free, vegetarian, no nuts"
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mealPlan.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
            <h3 className="font-medium text-green-800 mb-4">Your Weekly Meal Plan</h3>
            <div className="space-y-4">
              {mealPlan.map((day, index) => (
                <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                  <h4 className="font-medium text-green-700">{day.day}</h4>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-green-600 font-medium">BREAKFAST</p>
                      <p className="text-sm">{day.breakfast}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">LUNCH</p>
                      <p className="text-sm">{day.lunch}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-medium">DINNER</p>
                      <p className="text-sm">{day.dinner}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={getMealPlan}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Generating Meal Plan...
            </span>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {mealPlan.length > 0 ? "Regenerate Meal Plan" : "Generate Meal Plan"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

