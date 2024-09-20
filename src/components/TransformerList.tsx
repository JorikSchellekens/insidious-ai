import { useState, useMemo } from 'react';
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstantReactWeb, User, tx } from "@instantdb/react";
import { DBSchema } from "../types";
import { TransformerListItem } from './TransformerListItem';
import { TransformerForm } from './TransformerForm';

interface TransformerListProps {
  db: InstantReactWeb<DBSchema>;
  user: User;
}

type SortOption = "userLikes" | "creationDate" | "topLikes";

export function TransformerList({ db, user }: TransformerListProps) {
  const [sortOption, setSortOption] = useState<SortOption>("userLikes");
  const [editingTransformer, setEditingTransformer] = useState<{
    id: string;
    title: string;
    content: string;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data } = db.useQuery({
    transformers: {},
    likes: {},
  });

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

    switch (sortOption) {
      case 'creationDate':
        return transformersArray.sort((a, b) => b.createdAt - a.createdAt);
      case 'topLikes':
        return transformersArray.sort((a, b) => (likesCountMap[b.id] || 0) - (likesCountMap[a.id] || 0));
      case 'userLikes':
        return transformersArray.filter(t => userLikes.has(t.id));
      default:
        return transformersArray;
    }
  }, [data?.transformers, sortOption, userLikes, likesCountMap]);

  const handleDelete = (id: string) => {
    db.transact([tx.transformers[id].delete()]);
  };

  const handleEdit = (transformer: { id: string; title: string; content: string }) => {
    setEditingTransformer(transformer);
  };

  const handleSaveEdit = (title: string, content: string) => {
    if (editingTransformer) {
      db.transact([
        tx.transformers[editingTransformer.id].update({
          title,
          content,
          updatedAt: Date.now(),
        })
      ]);
      setEditingTransformer(null);
    }
  };

  const handleCreateNew = (title: string, content: string) => {
    const newId = crypto.randomUUID();
    db.transact([
      tx.transformers[newId].update({
        id: newId,
        title,
        content,
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

  if (!data) {
    return <div>Loading...</div>;
  }

  if (editingTransformer) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Transformer</h2>
        <TransformerForm
          initialTitle={editingTransformer.title}
          initialContent={editingTransformer.content}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditingTransformer(null)}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Content Transformers</h2>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="w-[180px] p-2 border rounded"
        >
          <option value="userLikes">My Likes</option>
          <option value="topLikes">Top Likes</option>
          <option value="creationDate">Newest</option>
        </select>
      </div>
      <ul className="space-y-2 mt-4">
        {sortedTransformers.map(transformer => (
          <TransformerListItem
            key={transformer.id}
            transformer={transformer}
            onDelete={handleDelete}
            onEdit={() => handleEdit(transformer)}
            onLike={() => handleLike(transformer.id)}
            onUnlike={() => handleUnlike(transformer.id)}
            likesCount={likesCountMap[transformer.id] || 0}
            isLikedByUser={userLikes.has(transformer.id)}
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