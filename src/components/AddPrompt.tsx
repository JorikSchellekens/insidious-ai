import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { usePromptContext } from '../contexts/PromptContext';

export function AddPrompt() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const { addPrompt } = usePromptContext();

  const handleAddPrompt = () => {
    addPrompt({ title, prompt });
    setTitle("");
    setPrompt("");
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
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here"
      />
      <Button onClick={handleAddPrompt}>Add Prompt</Button>
    </div>
  );
}