import React, { createContext, useContext } from 'react';
import { useTransformers } from '../hooks/useTransformers';
import { DBSchema, Transformer } from '../types';
import { InstantReactWeb } from '@instantdb/react';

interface TransformerContextType {
  transformers: Transformer[];
  addTransformer: (newTransformer: Omit<Transformer, 'id'>) => void;
  deleteTransformer: (id: string) => void;
  updateTransformer: (id: string, updates: Partial<Omit<Transformer, 'id'>>) => void;
}

const TransformerContext = createContext<TransformerContextType | undefined>(undefined);

export function TransformerProvider({ children, db }: { children: React.ReactNode; db: InstantReactWeb<DBSchema> }) {
  const { transformers, addTransformer, deleteTransformer, updateTransformer } = useTransformers(db);

  return (
    <TransformerContext.Provider value={{ transformers, addTransformer, deleteTransformer, updateTransformer }}>
      {children}
    </TransformerContext.Provider>
  );
}

export function useTransformerContext() {
  const context = useContext(TransformerContext);
  if (context === undefined) {
    throw new Error('useTransformerContext must be used within a TransformerProvider');
  }
  return context;
}