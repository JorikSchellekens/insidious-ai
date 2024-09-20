import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserSettings } from '../types';
import { improveTransformer, generateCategories } from '../utils/ai';

interface TransformerFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialCategories?: string[];
  onSubmit: (title: string, content: string, categories: string[]) => void;
  onCancel: () => void;
  submitLabel: string;
  userSettings: UserSettings;
}

export function TransformerForm({ 
  initialTitle = '', 
  initialContent = '', 
  initialCategories = [],
  onSubmit, 
  onCancel, 
  submitLabel,
  userSettings
}: TransformerFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [isImproving, setIsImproving] = useState(false);
  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);

  const handleGenerateCategories = useCallback(async (text: string) => {
    if (!text || !userSettings.apiKey) return;
    setIsGeneratingCategories(true);

    try {
      const generatedCategories = await generateCategories(userSettings, text);
      setCategories(generatedCategories);
    } catch (error) {
      console.error('Error generating categories:', error);
    } finally {
      setIsGeneratingCategories(false);
    }
  }, [userSettings]);

  useEffect(() => {
    if (content && categories.length === 0) {
      handleGenerateCategories(content);
    }
  }, [content, categories.length, handleGenerateCategories]);

  const handleSubmit = async () => {
    if (categories.length === 0) {
      await handleGenerateCategories(content);
    }
    onSubmit(title, content, categories);
    setTitle('');
    setContent('');
    setCategories([]);
  };

  const improveWithAI = async () => {
    setIsImproving(true);
    try {
      const improved = await improveTransformer(userSettings, title, content);
      setTitle(improved.title);
      setContent(improved.content);
    } catch (error) {
      console.error('Error improving with AI:', error);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter title"
      />
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Enter content"
        rows={5}
      />
      <div>
        <p>Categories:</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((category, index) => (
            <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm">
              {category}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-between space-x-2">
        <Button onClick={improveWithAI} disabled={isImproving}>
          {isImproving ? 'Improving...' : 'Improve with AI'}
        </Button>
        <Button onClick={() => handleGenerateCategories(content)} disabled={isGeneratingCategories}>
          {isGeneratingCategories ? 'Generating...' : 'Generate Categories'}
        </Button>
        <div>
          <Button onClick={onCancel} variant="outline" className="mr-2">Cancel</Button>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </div>
      </div>
    </div>
  );
}