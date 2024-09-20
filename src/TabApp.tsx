import React, { useState, useEffect } from 'react'
import { init } from '@instantdb/react'
import SettingsPageWrapper from './components/SettingsPageWrapper'
import SettingsPage from './pages/SettingsPage'
import FirstTimeFlow from './components/FirstTimeFlow'
import { DBSchema, Transformer, UserSettings } from './types'
import { TransformerCard } from './components/TransformerCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AI_PROVIDERS } from './constants'

const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a'

const db = init<DBSchema>({ appId: APP_ID })

function TabApp() {
  const { isLoading, user, error } = db.useAuth()
  const [sortOption, setSortOption] = useState<string>('newest')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { data } = db.useQuery({
    transformers: {},
    likes: {},
    userSettings: { $: { where: { id: user?.id } } },
  })

  const transformers = data?.transformers || []
  const likes = data?.likes || []
  const userSettings = data?.userSettings?.[0] as UserSettings | undefined

  const [transformersState, setTransformers] = useState<Transformer[]>([])

  useEffect(() => {
    if (user && transformers.length > 0 && userSettings) {
      generateCategories()
    }
  }, [user, transformers, userSettings])

  const generateCategories = async () => {
    if (!userSettings || !userSettings.apiKey || !userSettings.selectedModel) {
      console.error("User settings not loaded or API key not set")
      return
    }

    const updatedTransformers = await Promise.all(transformers.map(async (t) => {
      const categories = await getAIGeneratedCategories(t.content, userSettings)
      return {
        ...t,
        categories,
        likes: likes.filter(l => l.transformerId === t.id).length,
        isLiked: likes.some(l => l.transformerId === t.id && l.userId === user?.id)
      }
    }))

    setTransformers(updatedTransformers)
  }

  const getAIGeneratedCategories = async (content: string, settings: UserSettings): Promise<string[]> => {
    const provider = AI_PROVIDERS[settings.selectedModel as keyof typeof AI_PROVIDERS]
    if (!provider) {
      console.error(`Unsupported model: ${settings.selectedModel}`)
      return []
    }

    const prompt = {
      role: "system",
      content: "You are an AI assistant that generates categories for text transformation prompts. Given a transformer prompt, generate 2-3 relevant categories. Respond with only the categories, separated by commas, without any additional text or explanation."
    }

    const userPrompt = {
      role: "user",
      content: `Generate categories for this transformer prompt: "${content}"`
    }

    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: provider.headers(settings.apiKey),
        body: JSON.stringify(provider.bodyFormatter([prompt, userPrompt]))
      })

      const body = await response.json()
      let categoriesString: string

      if (settings.selectedModel.startsWith('claude')) {
        categoriesString = body.content[0].text
      } else {
        categoriesString = body.choices[0].message.content
      }

      return categoriesString.split(',').map(category => category.trim())
    } catch (error) {
      console.error('Error generating categories:', error)
      return []
    }
  }

  const handleLike = (id: string) => {
    // TODO: Implement actual like functionality with database update
    setTransformers(transformersState.map(t => 
      t.id === id ? { ...t, likes: t.isLiked ? t.likes - 1 : t.likes + 1, isLiked: !t.isLiked } : t
    ))
  }

  const sortedTransformers = [...transformersState].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return b.createdAt - a.createdAt
      case 'mostLiked':
        return b.likes - a.likes
      default:
        return 0
    }
  })

  const filteredTransformers = selectedCategory === 'all' 
    ? sortedTransformers 
    : sortedTransformers.filter(t => t.categories.includes(selectedCategory))

  const allCategories = Array.from(new Set(transformersState.flatMap(t => t.categories)))

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  
  if (error) {
    return <div className="flex items-center justify-center h-screen">Uh oh! {error.message}</div>
  }
  
  if (!user) return <FirstTimeFlow db={db} />

  return (
    <div className="min-h-screen bg-background">
      <SettingsPageWrapper settingsPage={<SettingsPage db={db} user={user} />}>
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Insidious New Tab</h1>
          <div className="flex justify-between mb-4">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="mostLiked">Most Liked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTransformers.map(transformer => (
              <TransformerCard key={transformer.id} transformer={transformer} onLike={handleLike} />
            ))}
          </div>
        </div>
      </SettingsPageWrapper>
    </div>
  )
}

export default TabApp