import React, { useState, useEffect } from 'react';
import { Button, Flex, ToggleButton } from '@aws-amplify/ui-react';
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

export function PromptList({ pluginState, updatePluginState, db }: PromptListProps) {
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
        <ToggleButton
          key={prompt.id}
          width="100%"
          isPressed={pluginState.promptSelected === prompt.id}
          onChange={() => handlePromptSelect(prompt.id)}
        >
          <Flex direction="column" justifyContent="space-between" alignItems="center" width="100%">
            <Flex direction="row" justifyContent="space-between" alignItems="center" width="100%">
              {prompt.title}
              <FaAngleDown width="20px" onClick={(e) => {
                e.stopPropagation();
                toggleExpand(prompt.id);
              }} />
            </Flex>
            {prompt.isExpanded && (
              <>
                <p>{prompt.prompt}</p>
                <Button onClick={(e) => {
                  e.stopPropagation();
                  deletePrompt(prompt.id);
                }}><MdDelete /></Button>
              </>
            )}
          </Flex>
        </ToggleButton>
      ))}
    </>
  );
}