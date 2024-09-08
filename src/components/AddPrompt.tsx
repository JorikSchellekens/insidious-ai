import { useState } from 'react';
import { Button, Input, TextAreaField } from '@aws-amplify/ui-react';
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
    <div id="addPrompt">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <TextAreaField
        label="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here"
      />
      <Button onClick={handleAddPrompt}>Add Prompt</Button>
    </div>
  );
}