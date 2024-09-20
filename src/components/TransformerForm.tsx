import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AI_PROVIDERS } from '../constants';
import { UserSettings } from '../types';

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

  const generateCategories = useCallback(async (text: string) => {
    if (!text || !userSettings.apiKey) return;
    setIsGeneratingCategories(true);

    const provider = AI_PROVIDERS[userSettings.selectedModel as keyof typeof AI_PROVIDERS];
    if (!provider) {
      console.error(`Unsupported model: ${userSettings.selectedModel}`);
      setIsGeneratingCategories(false);
      return;
    }

    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: provider.headers(userSettings.apiKey),
        body: JSON.stringify(provider.bodyFormatter([
          { 
            role: "system", 
            content: "You are a helpful assistant that generates relevant categories for a given text. Provide 3-5 categories as a comma-separated list."
          },
          {
            role: "user",
            content: `Generate categories for the following text: ${text}`
          }
        ]))
      });

      const data = await response.json();
      let generatedCategories;
      if (userSettings.selectedModel.startsWith('claude')) {
        generatedCategories = data.content[0].text.split(',').map((cat: string) => cat.trim());
      } else {
        generatedCategories = data.choices[0].message.content.split(',').map((cat: string) => cat.trim());
      }
      setCategories(generatedCategories);
    } catch (error) {
      console.error('Error generating categories:', error);
    } finally {
      setIsGeneratingCategories(false);
    }
  }, [userSettings]);

  useEffect(() => {
    if (content && categories.length === 0) {
      generateCategories(content);
    }
  }, [content, categories.length, generateCategories]);

  const handleSubmit = async () => {
    if (categories.length === 0) {
      await generateCategories(content);
    }
    onSubmit(title, content, categories);
    setTitle('');
    setContent('');
    setCategories([]);
  };

  const improveWithAI = async () => {
    setIsImproving(true);
    const provider = AI_PROVIDERS[userSettings.selectedModel as keyof typeof AI_PROVIDERS];
    if (!provider) {
      console.error(`Unsupported model: ${userSettings.selectedModel}`);
      setIsImproving(false);
      return;
    }

    const prompt = `Improve the following transformer prompt. Your task is to make it clear, concise, and effectively implement the intention of what's specified. If the original is high-level or poorly specified, expand on it appropriately. Focus on creating a prompt that can be used to modify text according to the user's request.

Respond only with the improved transformer, without any additional commentary or explanations. Format your response as a JSON object with 'title' and 'content' fields.

Original Title: ${title}
Original Content: ${content}

Your response should follow this format exactly:
{
  "title": "Improved Title Here",
  "content": "Improved content here. This should be a clear, concise instruction for modifying text according to the transformer's purpose."
}`;

    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: provider.headers(userSettings.apiKey),
        body: JSON.stringify(provider.bodyFormatter([
          { role: 'system', content: 'You are an AI assistant that improves transformer prompts for text modification tasks.' },
          { role: 'user', content: prompt }
        ]))
      });

      const data = await response.json();
      let improvedTitle, improvedContent;

      if (userSettings.selectedModel.startsWith('claude')) {
        const jsonContent = JSON.parse(data.content[0].text);
        improvedTitle = jsonContent.title;
        improvedContent = jsonContent.content;
      } else {
        const jsonContent = JSON.parse(data.choices[0].message.content);
        improvedTitle = jsonContent.title;
        improvedContent = jsonContent.content;
      }

      if (improvedTitle && improvedContent) {
        setTitle(improvedTitle);
        setContent(improvedContent);
      } else {
        throw new Error('Failed to extract improved title and content');
      }
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
        <Button onClick={() => generateCategories(content)} disabled={isGeneratingCategories}>
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