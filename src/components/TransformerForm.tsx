import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AI_PROVIDERS } from '../constants';
import { UserSettings } from '../types';

interface TransformerFormProps {
  initialTitle?: string;
  initialContent?: string;
  onSubmit: (title: string, content: string) => void;
  onCancel: () => void;
  submitLabel: string;
  userSettings: UserSettings;
}

export function TransformerForm({ 
  initialTitle = '', 
  initialContent = '', 
  onSubmit, 
  onCancel, 
  submitLabel,
  userSettings
}: TransformerFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isImproving, setIsImproving] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent]);

  const handleSubmit = () => {
    onSubmit(title, content);
    setTitle('');
    setContent('');
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
      console.log('Sending request to AI provider:', provider.url);
      console.log('Request body:', JSON.stringify(provider.bodyFormatter([
        { role: 'system', content: 'You are an AI assistant that improves transformer prompts for text modification tasks.' },
        { role: 'user', content: prompt }
      ])));

      const response = await fetch(provider.url, {
        method: 'POST',
        headers: provider.headers(userSettings.apiKey),
        body: JSON.stringify(provider.bodyFormatter([
          { role: 'system', content: 'You are an AI assistant that improves transformer prompts for text modification tasks.' },
          { role: 'user', content: prompt }
        ]))
      });

      const data = await response.json();
      console.log('Raw AI response:', data);

      let improvedTitle, improvedContent;

      if (userSettings.selectedModel.startsWith('claude-')) {
        const jsonContent = JSON.parse(data.content[0].text);
        improvedTitle = jsonContent.title;
        improvedContent = jsonContent.content;
      } else if (userSettings.selectedModel.startsWith('gpt-')) {
        const jsonContent = JSON.parse(data.choices[0].message.content);
        improvedTitle = jsonContent.title;
        improvedContent = jsonContent.content;
      } else {
        throw new Error('Unsupported AI model');
      }

      console.log('Parsed improved title:', improvedTitle);
      console.log('Parsed improved content:', improvedContent);

      if (improvedTitle && improvedContent) {
        setTitle(improvedTitle);
        setContent(improvedContent);
      } else {
        throw new Error('Failed to extract improved title and content');
      }
    } catch (error) {
      console.error('Error improving with AI:', error);
      // You might want to show an error message to the user here
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
      <div className="flex justify-between space-x-2">
        <Button onClick={improveWithAI} disabled={isImproving}>
          {isImproving ? 'Improving...' : 'Improve with AI'}
        </Button>
        <div>
          <Button onClick={onCancel} variant="outline" className="mr-2">Cancel</Button>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </div>
      </div>
    </div>
  );
}