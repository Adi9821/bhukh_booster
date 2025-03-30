import RecipeGenerator from "@/components/recipe-generator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-10 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-800 mb-2">Recipe Generator</h1>
          <p className="text-slate-600">Enter ingredients you have, and we'll suggest recipes you can make!</p>
        </header>
        <RecipeGenerator />
      </div>
    </main>
  )
}

