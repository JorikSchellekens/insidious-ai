import { useState, useMemo } from 'react'
import { init, tx } from '@instantdb/react'
import SettingsPageWrapper from './components/SettingsPageWrapper'
import SettingsPage from './pages/SettingsPage'
import FirstTimeFlow from './components/FirstTimeFlow'
import { DBSchema, Transformer } from './types'
import { TransformerCard } from './components/TransformerCard'
import { TransformerForm } from './components/TransformerForm'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { improveTransformer, remixTransformers, generateCategories } from './utils/ai'

const APP_ID = 'c0f5375a-23e1-45ca-ae1c-18a334d4e18a'

const db = init<DBSchema>({ appId: APP_ID })

function TabApp() {
  const { isLoading, user, error } = db.useAuth()
  const [sortOption, setSortOption] = useState<string>('newest')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingTransformer, setEditingTransformer] = useState<Transformer | null>(null)
  const [isRemixing, setIsRemixing] = useState(false)

  const { data } = db.useQuery({
    transformers: {},
    likes: {},
    userSettings: { $: { where: { id: user?.id } } },
  })

  const transformers = data?.transformers || []
  const likes = data?.likes || []
  const userSettings = data?.userSettings[0];

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

  // Handle User Settings not loaded return a loading state
  if (!userSettings) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

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

  const handleEdit = (transformerId: string) => {
    const transformer = transformers.find(t => t.id === transformerId);
    if (transformer) {
      setEditingTransformer(transformer);
    }
  }

  const handleSaveEdit = (title: string, content: string, categories: string[]) => {
    if (editingTransformer) {
      db.transact([
        tx.transformers[editingTransformer.id].update({
          title,
          content,
          categories,
          updatedAt: Date.now(),
        })
      ]);
      setEditingTransformer(null);
    }
  }

  const handleSelect = (transformerId: string) => {
    const currentSelected = userSettings.transformersSelected || [];
    const newSelected = currentSelected.includes(transformerId)
      ? currentSelected.filter(id => id !== transformerId)
      : [...currentSelected, transformerId];

    db.transact([
      tx.userSettings[user!.id].merge({ transformersSelected: newSelected })
    ]);
  }

  const handleRemix = async () => {
    if (!user || !userSettings) return;
    
    setIsRemixing(true);
    const selectedTransformers = transformers.filter(t => userSettings.transformersSelected.includes(t.id));
    
    try {
      const remixed = await remixTransformers(
        userSettings,
        selectedTransformers.map(t => ({ title: t.title, content: t.content }))
      );
      const newTransformerId = crypto.randomUUID();
      
      db.transact([
        tx.transformers[newTransformerId].update({
          id: newTransformerId,
          title: remixed.title,
          content: remixed.content,
          authorId: user.id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      ]);

      // Generate categories for the new transformer
      const categories = await generateCategories(userSettings, remixed.content);
      db.transact([
        tx.transformers[newTransformerId].update({ categories })
      ]);

      // Clear selected transformers
      db.transact([
        tx.userSettings[user.id].merge({ transformersSelected: [] })
      ]);
    } catch (error) {
      console.error('Error remixing transformers:', error);
    } finally {
      setIsRemixing(false);
    }
  };

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

  if (editingTransformer) {
    return (
      <div className="min-h-screen bg-background p-4">
        <h2 className="text-2xl font-bold mb-4">Edit Transformer</h2>
        <TransformerForm
          initialTitle={editingTransformer.title}
          initialContent={editingTransformer.content}
          initialCategories={editingTransformer.categories || []}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditingTransformer(null)}
          submitLabel="Save Changes"
          userSettings={userSettings}
        />
      </div>
    );
  }

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
                onEdit={handleEdit}
                onSelect={handleSelect}
                isLiked={userLikes.has(transformer.id)}
                isSelected={userSettings.transformersSelected.includes(transformer.id)}
                likesCount={likesCountMap[transformer.id] || 0}
                currentUserId={user.id}
              />
            ))}
          </div>
          {userSettings.transformersSelected.length > 1 && (
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={handleRemix}
                disabled={isRemixing}
              >
                {isRemixing ? 'Remixing...' : 'Remix Selected Transformers'}
              </Button>
            </div>
          )}
        </div>
      </SettingsPageWrapper>
    </div>
  )
}

export default TabApp