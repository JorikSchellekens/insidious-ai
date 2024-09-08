import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { FaAngleDown } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { PluginState } from '../types';
import { usePromptContext } from '../contexts/PromptContext';

interface PromptListProps {
  pluginState: PluginState;
  updatePluginState: (newState: Partial<PluginState>) => void;
  db: IDBDatabase;
}

type PromptWithUIState = ReturnType<typeof usePromptContext>['prompts'][number] & { isExpanded: boolean };

export function PromptList({ pluginState, updatePluginState }: PromptListProps) {
  const { prompts, deletePrompt } = usePromptContext();
  const [promptsWithState, setPromptsWithState] = useState<PromptWithUIState[]>([]);

  useEffect(() => {
    setPromptsWithState(prompts.map(prompt => ({ ...prompt, isExpanded: false })));
  }, [prompts]);

  const toggleExpand = (id: number) => {
    setPromptsWithState(prev => 
      prev.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p)
    );
  };

  const handlePromptSelect = (id: number) => {
    updatePluginState({ promptSelected: id });
  };

  return (
    <>
      {promptsWithState.map((prompt) => (
        <Toggle
          key={prompt.id}
          pressed={pluginState.promptSelected === prompt.id}
          onPressedChange={() => handlePromptSelect(prompt.id)}
          className="w-full"
        >
          <div className="flex flex-col justify-between items-center w-full">
            <div className="flex flex-row justify-between items-center w-full">
              {prompt.title}
              <FaAngleDown className="w-5 h-5" onClick={(e) => {
                e.stopPropagation();
                toggleExpand(prompt.id);
              }} />
            </div>
            {prompt.isExpanded && (
              <>
                <p>{prompt.prompt}</p>
                <Button variant="destructive" size="icon" onClick={(e) => {
                  e.stopPropagation();
                  deletePrompt(prompt.id);
                }}><MdDelete /></Button>
              </>
            )}
          </div>
        </Toggle>
      ))}
    </>
  );
}