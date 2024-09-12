import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTransformers } from '../hooks/useTransformers';
import { InstantReactWeb, User } from '@instantdb/react';
import { DBSchema } from '../types';

export function AddPrompt(user: User, db: InstantReactWeb<DBSchema>) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { addTransformer } = useTransformers(db);

  const handleAddPrompt = () => {
    addTransformer({
        title,
        content,
        authorId: user.id,
    });
    setTitle("");
    setContent("");
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter your prompt here"
      />
      <Button onClick={handleAddPrompt}>Add Prompt</Button>
    </div>
  );
}