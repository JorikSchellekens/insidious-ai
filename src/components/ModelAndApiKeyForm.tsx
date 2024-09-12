import React from 'react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_PROVIDERS } from '../constants';

interface ModelAndApiKeyFormProps {
  model: string;
  setModel: (model: string) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

const ModelAndApiKeyForm: React.FC<ModelAndApiKeyFormProps> = ({
  model,
  setModel,
  apiKey,
  setApiKey,
  error,
  onSubmit
}) => {
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const llmModels = AI_PROVIDERS ? Object.keys(AI_PROVIDERS).map(model => ({
    value: model,
    label: model
  })) : [];

  return (
    <motion.form
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeVariants}
      onSubmit={onSubmit}
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
        Complete Setup
      </Button>
    </motion.form>
  );
};

export default ModelAndApiKeyForm;