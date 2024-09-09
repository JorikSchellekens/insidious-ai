import { useState, useEffect } from 'react';
import { Prompt } from '../types';

export function usePrompts(db: IDBDatabase) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    // Load prompts from IndexedDB
    const transaction = db.transaction(['prompts'], 'readonly');
    const objectStore = transaction.objectStore('prompts');
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      setPrompts((event.target as IDBRequest).result);
    };
  }, [db]);

  const addPrompt = (newPrompt: Omit<Prompt, 'id'>) => {
    const transaction = db.transaction(['prompts'], 'readwrite');
    const objectStore = transaction.objectStore('prompts');
    const request = objectStore.add(newPrompt);

    request.onsuccess = (event) => {
      const id = (event.target as IDBRequest).result as number;
      setPrompts([...prompts, { id, ...newPrompt }]);
    };
  };

  const deletePrompt = (id: number) => {
    const transaction = db.transaction(['prompts'], 'readwrite');
    const objectStore = transaction.objectStore('prompts');
    objectStore.delete(id);

    setPrompts(prompts.filter(prompt => prompt.id !== id));
  };

  const updatePrompt = (id: number, updates: Partial<Omit<Prompt, 'id'>>) => {
    const transaction = db.transaction(['prompts'], 'readwrite');
    const objectStore = transaction.objectStore('prompts');
    const request = objectStore.get(id);

    request.onsuccess = (event) => {
      const prompt = (event.target as IDBRequest).result;
      const updatedPrompt = { ...prompt, ...updates };
      objectStore.put(updatedPrompt);

      setPrompts(prompts.map(p => p.id === id ? updatedPrompt : p));
    };
  };

  const createPrompt = (newPrompt: Omit<Prompt, 'id'>) => {
    addPrompt(newPrompt);
  };

  return { prompts, addPrompt, deletePrompt, updatePrompt, createPrompt };
}