import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_PROVIDERS } from '../constants';

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

interface FirstTimeFlowProps {
  onComplete: (model: string, apiKey: string) => void;
}

const FirstTimeFlow: React.FC<FirstTimeFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const skipIntro = useCallback(() => {
    setStep(2);
  }, []);

  useEffect(() => {
    if (step < 2) {
      const timer = setTimeout(() => setStep(prev => prev + 1), 2000);
      
      const handleSkip = () => {
        clearTimeout(timer);
        skipIntro();
      };

      window.addEventListener('click', handleSkip);
      window.addEventListener('keydown', handleSkip);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('click', handleSkip);
        window.removeEventListener('keydown', handleSkip);
      };
    }
  }, [step, skipIntro]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model) {
      setError('Please select a model');
      return;
    }
    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }
    onComplete(model, apiKey);
  };

  const llmModels = AI_PROVIDERS ? Object.keys(AI_PROVIDERS).map(model => ({
    value: model,
    label: model
  })) : [];

  return (
    <div className="flex items-center justify-center bg-white min-h-[400px] min-w-[300px] p-4">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.h1
            key="title"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            className="text-4xl font-bold text-black"
          >
            Insidious AI
          </motion.h1>
        )}
        {step === 1 && (
          <motion.h2
            key="subtitle"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            className="text-2xl font-semibold text-black"
          >
            Control your reality
          </motion.h2>
        )}
        {step === 2 && (
          <motion.form
            key="form"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeVariants}
            onSubmit={handleSubmit}
            className="space-y-4 w-full max-w-[280px]"
          >
            <Select
              value={model}
              onValueChange={setModel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select LLM model" />
              </SelectTrigger>
              <SelectContent>
                {llmModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="password"
              placeholder="Enter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">
              Configure
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstTimeFlow;