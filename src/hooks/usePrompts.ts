import { useState, useEffect } from 'react';
import { Prompt } from '../types';

export function usePrompts(db: IDBDatabase) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    db.transaction("prompts")
      .objectStore("prompts")
      .getAll().onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          setPrompts(result);
        }
      };
  }, [db]);

  const addPrompt = (newPrompt: Omit<Prompt, 'id'>) => {
    const transaction = db.transaction("prompts", "readwrite");
    const store = transaction.objectStore("prompts");

    store.add(newPrompt).onsuccess = (event) => {
      const id = (event.target as IDBRequest).result;
      setPrompts([...prompts, { ...newPrompt, id }]);
    };
  };

  const deletePrompt = (id: number) => {
    setPrompts(prompts.filter(p => p.id !== id));
    db.transaction("prompts", "readwrite")
      .objectStore("prompts")
      .delete(id);
  };

  return { prompts, setPrompts, addPrompt, deletePrompt };
}