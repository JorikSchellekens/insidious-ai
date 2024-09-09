import { useState } from "react";
import { PlusCircle, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PluginState } from '../types';
import { usePromptContext } from '../contexts/PromptContext';

interface PromptListProps {
  pluginState: PluginState;
  updatePluginState: (newState: Partial<PluginState>) => void;
}

export function PromptList({ pluginState, updatePluginState }: PromptListProps) {
  const { prompts, deletePrompt, updatePrompt, createPrompt } = usePromptContext();
  const [editingPrompt, setEditingPrompt] = useState<{ id?: number; title: string; prompt: string } | null>(null);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");

  const handleSelect = (id: number) => {
    updatePluginState({ promptSelected: id });
  };

  const handleEdit = (prompt: { id: number; title: string; prompt: string }) => {
    setEditingPrompt(prompt);
    setNewPromptTitle(prompt.title);
    setNewPromptContent(prompt.prompt);
  };

  const handleSaveEdit = () => {
    if (editingPrompt) {
      if (editingPrompt.id) {
        // Update existing prompt
        updatePrompt(editingPrompt.id, { title: newPromptTitle, prompt: newPromptContent });
      } else {
        // Create new prompt
        createPrompt({ title: newPromptTitle, prompt: newPromptContent });
      }
      setEditingPrompt(null);
      setNewPromptTitle("");
      setNewPromptContent("");
    }
  };

  const handleDelete = (id: number) => {
    deletePrompt(id);
    if (pluginState.promptSelected === id) {
      updatePluginState({ promptSelected: undefined });
    }
  };

  const handleCreateNew = () => {
    setEditingPrompt({ title: "", prompt: "" });
    setNewPromptTitle("");
    setNewPromptContent("");
  };

  if (editingPrompt) {
    return (
      <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
        <Button
          onClick={() => setEditingPrompt(null)}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Prompts
        </Button>
        <h2 className="text-2xl font-bold mb-4">
          {editingPrompt.id ? "Edit Prompt" : "Create New Prompt"}
        </h2>
        <div className="space-y-4">
          <Input
            value={newPromptTitle}
            onChange={(e) => setNewPromptTitle(e.target.value)}
            placeholder="Enter title"
          />
          <Textarea
            value={newPromptContent}
            onChange={(e) => setNewPromptContent(e.target.value)}
            placeholder="Enter prompt content"
            rows={5}
          />
          <Button onClick={handleSaveEdit} className="w-full">
            {editingPrompt.id ? "Save Changes" : "Create Prompt"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-background shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Content Transformers</h2>
      <ul className="space-y-2">
        {prompts.map(prompt => (
          <li
            key={prompt.id}
            className={`p-2 rounded-r-md hover:bg-accent group border-l-4 relative ${
              pluginState.promptSelected === prompt.id ? 'border-primary bg-accent' : 'border-transparent'
            }`}
            onClick={() => handleSelect(prompt.id)}
          >
            <div className="w-full pr-16 overflow-hidden">
              <span className="text-sm font-medium truncate block">{prompt.title}</span>
            </div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(prompt);
                }}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(prompt.id);
                }}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button onClick={handleCreateNew} className="mt-4 w-full">
        <PlusCircle className="w-4 h-4 mr-2" /> Create New Content Transformer
      </Button>
    </div>
  );
}