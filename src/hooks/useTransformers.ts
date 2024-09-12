import { useState, useEffect } from 'react';
import { DBSchema, Transformer } from '../types';
import { InstantReactWeb, tx } from '@instantdb/react';

export function useTransformers(db: InstantReactWeb<DBSchema>) {
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const { isLoading, error, data } = db.useQuery({ transformers: {} });

  useEffect(() => {
    if (!isLoading && !error && data) {
      setTransformers(data.transformers);
    }
  }, [isLoading, error, data]);
  const addTransformer = (newTransformer: Omit<Transformer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const transformerId = crypto.randomUUID();
    const now = Date.now();
    const transformerWithTimestamps = {
      ...newTransformer,
      createdAt: now,
      updatedAt: now,
    };
    db.transact([
      tx.transformers[transformerId].update(transformerWithTimestamps),
    ]);
    setTransformers([...transformers, { id: transformerId, ...transformerWithTimestamps }]);
  };

  const deleteTransformer = (id: string) => {
    db.transact([tx.transformers[id].delete()]);
    setTransformers(transformers.filter(transformer => transformer.id !== id));
  };

  const updateTransformer = (id: string, updates: Partial<Omit<Transformer, 'id'>>) => {
    const updatesWithTimestamp = { ...updates, updatedAt: Date.now() };
    db.transact([tx.transformers[id].merge(updatesWithTimestamp)]);
    setTransformers(transformers.map(t => t.id === id ? { ...t, ...updatesWithTimestamp } : t));
  };

  return { transformers, addTransformer, deleteTransformer, updateTransformer };
}