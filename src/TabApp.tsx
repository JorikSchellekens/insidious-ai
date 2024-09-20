import React, { useState, useMemo } from 'react'
import { init, tx } from '@instantdb/react'
import SettingsPageWrapper from './components/SettingsPageWrapper'
import SettingsPage from './pages/SettingsPage'
import FirstTimeFlow from './components/FirstTimeFlow'
import { DBSchema, Transformer } from './types'
import { TransformerCard } from './components/TransformerCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const userLikes = useMemo(() => {
    const likesMap = new Set<string>();
    likes
      .filter((like) => like.userId === user?.id)
      .forEach((like) => likesMap.add(like.transformerId));
    return likesMap;
  }, [likes, user?.id]);

  const likesCountMap = useMemo(() => {
    const countMap: { [key: string]: number } = {};
    likes.forEach((like) => {
      countMap[like.transformerId] = (countMap[like.transformerId] || 0) + 1;
    });
    return countMap;
  }, [likes]);

  const handleLike = (transformerId: string) => {
    if (!user) return;

    if (userLikes.has(transformerId)) {
      // Unlike
      const likeToRemove = likes.find(like => like.transformerId === transformerId && like.userId === user.id);
      if (likeToRemove) {
        db.transact([
          tx.likes[likeToRemove.id].delete(),
        ]);
      }
    } else {
      // Like
      const likeId = crypto.randomUUID();
      db.transact([
        tx.likes[likeId].update({
          id: likeId,
          userId: user.id,
          transformerId: transformerId,
          createdAt: Date.now(),
        }),
      ]);
    }
  }

  const sortedTransformers = [...transformers].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return b.createdAt - a.createdAt
      case 'mostLiked':
        return (likesCountMap[b.id] || 0) - (likesCountMap[a.id] || 0)
      default:
        return 0
    }
  })

  const filteredTransformers = selectedCategory === 'all' 
    ? sortedTransformers 
    : sortedTransformers.filter(t => t.categories?.includes(selectedCategory))

  const allCategories = Array.from(new Set(transformers.flatMap(t => t.categories || [])))

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
              <TransformerCard 
                key={transformer.id} 
                transformer={transformer} 
                onLike={handleLike}
                isLiked={userLikes.has(transformer.id)}
                likesCount={likesCountMap[transformer.id] || 0}
              />
            ))}
          </div>
        </div>
      </SettingsPageWrapper>
    </div>
  )
}

export default TabApp