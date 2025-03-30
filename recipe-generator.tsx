"use client"

import { useState, useEffect } from "react"
import type { KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Trash2, Plus, Search, AlertCircle, Heart, ExternalLink, ChefHat, Sparkles } from "lucide-react"
import {
  searchRecipesByIngredients,
  getRecipeDetails,
  searchRecipesByQuery,
  getRandomRecipes,
} from "@/app/actions/recipe-actions"
import type { RecipeSearchResult, RecipeDetails } from "@/app/actions/recipe-actions"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AIRecipeIdeas from "./ai-recipe-ideas"
import AIRecipeEnhancer from "./ai-recipe-enhancer"
import AIMealPlanner from "./ai-meal-planner"

export default function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<RecipeSearchResult[]>([])
  const [randomRecipes, setRandomRecipes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null)
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("ingredients")
  const [mainTab, setMainTab] = useState<string>("search")

  // Load random recipes on initial render
  useEffect(() => {
    fetchRandomRecipes()
  }, [])

  const fetchRandomRecipes = async () => {
    setIsLoadingRandom(true)
    try {
      const result = await getRandomRecipes()
      if (result.success && result.data) {
        setRandomRecipes(result.data.recipes)
      }
    } catch (err) {
      console.error("Error fetching random recipes:", err)
    } finally {
      setIsLoadingRandom(false)
    }
  }

  const handleAddIngredient = () => {
    const trimmedInput = inputValue.trim().toLowerCase()
    if (trimmedInput && !ingredients.includes(trimmedInput)) {
      setIngredients([...ingredients, trimmedInput])
      setInputValue("")
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddIngredient()
    }
  }

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      searchByQuery()
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((item) => item !== ingredient))
  }

  const findRecipes = async () => {
    if (ingredients.length === 0) return

    setIsLoading(true)
    setHasSearched(true)
    setError(null)

    try {
      const result = await searchRecipesByIngredients(ingredients)

      if (result.success && result.data) {
        setRecipes(result.data)
      } else {
        setError(result.error || "Failed to fetch recipes")
        setRecipes([])
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setRecipes([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchByQuery = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setHasSearched(true)
    setError(null)

    try {
      const result = await searchRecipesByQuery(searchQuery)

      if (result.success && result.data) {
        // Convert the search results to match our RecipeSearchResult interface as closely as possible
        const adaptedResults = result.data.results.map((item) => ({
          id: item.id,
          title: item.title,
          image: item.image,
          imageType: item.imageType,
          usedIngredientCount: 0,
          missedIngredientCount: 0,
          missedIngredients: [],
          usedIngredients: [],
          unusedIngredients: [],
          likes: item.aggregateLikes || 0,
        }))

        setRecipes(adaptedResults)
      } else {
        setError(result.error || "Failed to fetch recipes")
        setRecipes([])
      }
    } catch (err) {
      setError("An unexpected error occurred")
      setRecipes([])
    } finally {
      setIsLoading(false)
    }
  }

  const viewRecipeDetails = async (recipeId: number) => {
    setIsLoadingRecipe(true)

    try {
      const result = await getRecipeDetails(recipeId)

      if (result.success && result.data) {
        setSelectedRecipe(result.data)
        setIsRecipeDialogOpen(true)
      } else {
        setError(result.error || "Failed to fetch recipe details")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoadingRecipe(false)
    }
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="search" value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Recipe Search</TabsTrigger>
          <TabsTrigger value="ai">AI Recipe Ideas</TabsTrigger>
          <TabsTrigger value="meal-plan">Meal Planner</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4 space-y-6">
          <Tabs defaultValue="ingredients" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">Search by Ingredients</TabsTrigger>
              <TabsTrigger value="name">Search by Name</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="mt-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-orange-800">What ingredients do you have?</h2>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter an ingredient (e.g., pasta, tomatoes, chicken)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={handleAddIngredient} variant="outline" size="icon" disabled={!inputValue.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6 min-h-10">
                  {ingredients.length > 0 ? (
                    ingredients.map((ingredient) => (
                      <Badge
                        key={ingredient}
                        variant="secondary"
                        className="px-3 py-1 bg-orange-100 text-orange-800 hover:bg-orange-200"
                      >
                        {ingredient}
                        <button
                          onClick={() => handleRemoveIngredient(ingredient)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                          aria-label={`Remove ${ingredient}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm italic">Add some ingredients to get started</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={findRecipes}
                    disabled={ingredients.length === 0 || isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Finding recipes...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Find Recipes
                      </span>
                    )}
                  </Button>

                  {ingredients.length > 0 && (
                    <Button
                      onClick={() => setMainTab("ai")}
                      variant="outline"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Recipe Ideas
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="name" className="mt-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-orange-800">Search for a recipe</h2>

                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter recipe name (e.g., lasagna, chocolate cake)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={searchByQuery} variant="outline" disabled={!searchQuery.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasSearched && !error && (
            <div className="space-y-6">
              {recipes.length > 0 ? (
                <>
                  <h2 className="text-2xl font-semibold text-orange-800">
                    Found {recipes.length} Recipe{recipes.length !== 1 ? "s" : ""}
                  </h2>

                  <div className="space-y-6">
                    {recipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onViewRecipe={() => viewRecipeDetails(recipe.id)}
                        isLoading={isLoadingRecipe}
                        showIngredientMatch={activeTab === "ingredients"}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow-md">
                  <h3 className="text-xl font-medium text-slate-800 mb-2">No recipes found</h3>
                  <p className="text-slate-600 mb-4">
                    {activeTab === "ingredients"
                      ? "Try adding different ingredients or using more common ingredients."
                      : "Try a different search term or be more specific."}
                  </p>
                  <p className="text-slate-500 italic">
                    {activeTab === "ingredients"
                      ? 'Tip: Try ingredients like "pasta", "rice", "chicken", "tomatoes", or "garlic"'
                      : 'Tip: Try searching for "pasta", "soup", "chicken", or "cake"'}
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasSearched && randomRecipes.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-orange-800">Recipe Inspiration</h2>
                <Button variant="ghost" size="sm" onClick={fetchRandomRecipes} disabled={isLoadingRandom}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {randomRecipes.map((recipe) => (
                  <RandomRecipeCard key={recipe.id} recipe={recipe} onViewRecipe={() => viewRecipeDetails(recipe.id)} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-6">
          <AIRecipeIdeas ingredients={ingredients} />

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-800">Add Ingredients for AI Suggestions</h2>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter an ingredient (e.g., pasta, tomatoes, chicken)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={handleAddIngredient} variant="outline" size="icon" disabled={!inputValue.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 min-h-10">
              {ingredients.length > 0 ? (
                ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="px-3 py-1 bg-orange-100 text-orange-800 hover:bg-orange-200"
                  >
                    {ingredient}
                    <button
                      onClick={() => handleRemoveIngredient(ingredient)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                      aria-label={`Remove ${ingredient}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">Add some ingredients to get AI recipe suggestions</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="meal-plan" className="mt-4">
          <AIMealPlanner />
        </TabsContent>
      </Tabs>

      <RecipeDetailsDialog
        recipe={selectedRecipe}
        isOpen={isRecipeDialogOpen}
        onClose={() => setIsRecipeDialogOpen(false)}
      />
    </div>
  )
}

interface RecipeCardProps {
  recipe: RecipeSearchResult
  onViewRecipe: () => void
  isLoading: boolean
  showIngredientMatch: boolean
}

function RecipeCard({ recipe, onViewRecipe, isLoading, showIngredientMatch }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="md:flex">
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${recipe.image})` }}
            aria-label={recipe.title}
          />
        </div>
        <div className="md:w-2/3">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-orange-800">{recipe.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>{recipe.likes} likes</span>
                </CardDescription>
              </div>
              {showIngredientMatch && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} ingredients
                  match
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {showIngredientMatch && recipe.usedIngredients.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-slate-700">Ingredients you have:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.usedIngredients.map((ingredient) => (
                    <Badge
                      key={ingredient.id}
                      variant="secondary"
                      className="bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      {ingredient.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {showIngredientMatch && recipe.missedIngredients.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-slate-700">Missing ingredients:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.missedIngredients.map((ingredient) => (
                    <Badge
                      key={ingredient.id}
                      variant="secondary"
                      className="bg-slate-100 text-slate-800 hover:bg-slate-200"
                    >
                      {ingredient.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button variant="outline" className="w-full" onClick={onViewRecipe} disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Loading...
                </span>
              ) : (
                "View Full Recipe"
              )}
            </Button>
          </CardFooter>
        </div>
      </div>
    </Card>
  )
}

interface RandomRecipeCardProps {
  recipe: any
  onViewRecipe: () => void
}

function RandomRecipeCard({ recipe, onViewRecipe }: RandomRecipeCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${recipe.image})` }}
          aria-label={recipe.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-medium text-lg line-clamp-2">{recipe.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-white/90 text-sm">
            <Clock className="h-3 w-3" />
            <span>{recipe.readyInMinutes} min</span>
            <span className="mx-1">•</span>
            <ChefHat className="h-3 w-3" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>
      <CardFooter className="p-3">
        <Button variant="ghost" className="w-full" onClick={onViewRecipe}>
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  )
}

interface RecipeDetailsDialogProps {
  recipe: RecipeDetails | null
  isOpen: boolean
  onClose: () => void
}

function RecipeDetailsDialog({ recipe, isOpen, onClose }: RecipeDetailsDialogProps) {
  if (!recipe) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-orange-800">{recipe.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Ready in {recipe.readyInMinutes} minutes
            </span>
            <span className="mx-1">•</span>
            <span>{recipe.servings} servings</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="relative h-64 rounded-md overflow-hidden">
            <div
              className="absolute inset-0 bg-center bg-cover"
              style={{ backgroundImage: `url(${recipe.image})` }}
              aria-label={recipe.title}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.dishTypes?.map((type, index) => (
              <Badge key={index} variant="outline" className="capitalize">
                {type}
              </Badge>
            ))}
            {recipe.diets?.map((diet, index) => (
              <Badge key={index} className="bg-green-100 text-green-800 capitalize">
                {diet}
              </Badge>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Ingredients</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.extendedIngredients?.map((ingredient) => (
                <li key={ingredient.id} className="flex items-center gap-2">
                  <span className="text-sm">
                    {ingredient.amount} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Instructions</h3>
            {recipe.analyzedInstructions?.length > 0 ? (
              <ol className="space-y-4">
                {recipe.analyzedInstructions[0].steps.map((step) => (
                  <li key={step.number} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-medium">
                      {step.number}
                    </div>
                    <p className="text-slate-700">{step.step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: recipe.instructions || "No instructions available." }} />
            )}
          </div>

          <AIRecipeEnhancer recipe={recipe} />

          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => window.open(recipe.sourceUrl, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

