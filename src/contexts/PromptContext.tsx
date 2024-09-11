import React, { createContext, useContext } from 'react';
import { usePrompts } from '../hooks/usePrompts';
import { Prompt } from '../types';

interface PromptContextType {
  prompts: Prompt[];
  addPrompt: (newPrompt: Omit<Prompt, 'id'>) => void;
  deletePrompt: (id: string) => void;
  updatePrompt: (id: string, updates: Partial<Omit<Prompt, 'id'>>) => void;
  createPrompt: (newPrompt: Omit<Prompt, 'id'>) => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children, db }: { children: React.ReactNode; db: IDBDatabase }) {
  const { prompts, addPrompt, deletePrompt, updatePrompt, createPrompt } = usePrompts(db);

  return (
    <PromptContext.Provider value={{ prompts, addPrompt, deletePrompt, updatePrompt, createPrompt }}>
      {children}
    </PromptContext.Provider>
  );
}

export function usePromptContext() {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error('usePromptContext must be used within a PromptProvider');
  }
  return context;
}