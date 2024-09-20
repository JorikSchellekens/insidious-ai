import { useState, useMemo } from 'react';
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstantReactWeb, User, tx } from "@instantdb/react";
import { DBSchema } from "../types";
import { TransformerListItem } from './TransformerListItem';
import { TransformerForm } from './TransformerForm';
import { UserSettings, Transformer } from '../types';

interface TransformerListProps {
  db: InstantReactWeb<DBSchema>;
  user: User;
}

type ListOption = "likedTransformers" | "creationDate" | "topLikes" | "selected" | "myTransformers";

export function TransformerList({ db, user }: TransformerListProps) {
  const [listOption, setListOption] = useState<ListOption>("likedTransformers");
  const [editingTransformer, setEditingTransformer] = useState<Transformer | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data } = db.useQuery({
    transformers: {},
    likes: {},
    userSettings: { $: { where: { id: user.id } } },
  });

  const userSettings: UserSettings = data?.userSettings[0] || {
    email: '',
    apiKey: '',
    pluginActive: false,
    transformersSelected: [],
    paragraphLimit: 0,
    selectedModel: '',
    hoverToReveal: false
  };

  const userLikes = useMemo(() => {
    const likesMap = new Set<string>();
    data?.likes
      ?.filter((like) => like.userId === user.id)
      .forEach((like) => likesMap.add(like.transformerId));
    return likesMap;
  }, [data?.likes, user.id]);

  const likesCountMap = useMemo(() => {
    const countMap: { [key: string]: number } = {};
    data?.likes?.forEach((like) => {
      countMap[like.transformerId] = (countMap[like.transformerId] || 0) + 1;
    });
    return countMap;
  }, [data?.likes]);

  const sortedTransformers = useMemo(() => {
    let transformersArray = [...(data?.transformers || [])];

    if (listOption === "selected") {
      transformersArray = transformersArray.filter(t => data?.userSettings[0]?.transformersSelected.includes(t.id));
    } else if (listOption === "likedTransformers") {
      transformersArray = transformersArray.filter(t => userLikes.has(t.id));
    } else if (listOption === "topLikes") {
      transformersArray.sort((a, b) => (likesCountMap[b.id] || 0) - (likesCountMap[a.id] || 0));
    } else if (listOption === "creationDate") {
      transformersArray.sort((a, b) => b.createdAt - a.createdAt);
    } else if (listOption === "myTransformers") {
      transformersArray = transformersArray.filter(t => t.authorId === user.id);
    }

    return transformersArray;
  }, [data?.transformers, listOption, userLikes, likesCountMap, data?.userSettings, user.id]);

  const handleDelete = (id: string) => {
    db.transact([tx.transformers[id].delete()]);
  };

  const handleEdit = (transformer: {
    id: string;
} & Transformer) => {
    setEditingTransformer(transformer);
  };

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
  };

  const handleCreateNew = (title: string, content: string, categories: string[]) => {
    const newId = crypto.randomUUID();
    db.transact([
      tx.transformers[newId].update({
        id: newId,
        title,
        content,
        categories,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        authorId: user.id
      })
    ]);
    setIsCreating(false);
  };

  const handleLike = (transformerId: string) => {
    const likeId = crypto.randomUUID();
    db.transact([
      tx.likes[likeId].update({
        id: likeId,
        userId: user.id,
        transformerId: transformerId,
        createdAt: Date.now(),
      }),
    ]);
  };

  const handleUnlike = (transformerId: string) => {
    const userLike = data?.likes.find(like => like.transformerId === transformerId && like.userId === user.id);
    if (userLike) {
      db.transact([
        tx.likes[userLike.id].delete(),
      ]);
    }
  };

  const handleSelect = (id: string) => {
    const currentSelected = data?.userSettings[0]?.transformersSelected || [];
    const newSelected = currentSelected.includes(id)
      ? currentSelected.filter(tId => tId !== id)
      : [...currentSelected, id];

    db.transact([
      tx.userSettings[user.id].merge({ transformersSelected: newSelected })
    ]);
    // Notify the service worker that the prompt has changed
    chrome.runtime.sendMessage({ type: "promptChanged" });
  };

  if (!data) {
    return <div>Loading...</div>;
  }

  const selectedTransformerIds = data.userSettings[0]?.transformersSelected || [];

  if (editingTransformer) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Transformer</h2>
        <TransformerForm
          initialTitle={editingTransformer.title}
          initialContent={editingTransformer.content}
          initialCategories={editingTransformer.categories}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditingTransformer(null)}
          submitLabel="Save Changes"
          userSettings={userSettings}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Content Transformers</h2>
        <select
          value={listOption}
          onChange={(e) => setListOption(e.target.value as ListOption)}
          className="p-2 border rounded"
        >
          <option value="likedTransformers">Liked Transformers</option>
          <option value="myTransformers">My Transformers</option>
          <option value="topLikes">Top Likes</option>
          <option value="creationDate">Newest</option>
          <option value="selected">Selected Transformers</option>
        </select>
      </div>
      <ul className="space-y-2 mt-4">
        {sortedTransformers.map(transformer => (
          <TransformerListItem
            key={transformer.id}
            transformer={{
              id: transformer.id,
              title: transformer.title,
              updatedAt: transformer.updatedAt,
              categories: transformer.categories,
              authorId: transformer.authorId // Add this line
            }}
            onDelete={handleDelete}
            onEdit={() => handleEdit(transformer)}
            onLike={() => handleLike(transformer.id)}
            onUnlike={() => handleUnlike(transformer.id)}
            onSelect={() => handleSelect(transformer.id)}
            likesCount={likesCountMap[transformer.id] || 0}
            isLikedByUser={userLikes.has(transformer.id)}
            isSelected={selectedTransformerIds.includes(transformer.id)}
            currentUserId={user.id} // Add this line
          />
        ))}
      </ul>
      {isCreating ? (
        <div className="mt-4">
          <h3 className="text-xl font-bold mb-2">Create New Transformer</h3>
          <TransformerForm
            onSubmit={handleCreateNew}
            onCancel={() => setIsCreating(false)}
            submitLabel="Create Transformer"
            userSettings={userSettings}
          />
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="w-full mt-4">
          <PlusCircle className="w-4 h-4 mr-2" /> Create New Content Transformer
        </Button>
      )}
    </div>
  );
}