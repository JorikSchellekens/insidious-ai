import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PluginState } from '../types';

interface SecretKeyInputProps {
  db: IDBDatabase;
  pluginState: PluginState;
  updatePluginState: (newState: Partial<PluginState>) => void;
}

export function SecretKeyInput({ pluginState, updatePluginState }: SecretKeyInputProps) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateApiKey = (key: string, model: string) => {
    if (model.startsWith('gpt-')) {
      return /^sk-[A-Za-z0-9]{48}$/.test(key);
    } else if (model.startsWith('claude-')) {
      return /^sk-ant-api\d{2}-.{32,100}$/.test(key);
    }
    return false;
  };

  const handleValidate = () => {
    if (validateApiKey(pluginState.apiKey, pluginState.selectedModel)) {
      updatePluginState({ apiKey: pluginState.apiKey });
      setHasError(false);
      setErrorMessage("");
    } else {
      setHasError(true);
      setErrorMessage(`Invalid API key format for ${pluginState.selectedModel}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="api-key">API Key</Label>
      <Input
        id="api-key"
        className={hasError ? "border-red-500" : ""}
        placeholder={pluginState.apiKey || "Enter your API key"}
        onChange={(e) => {
          updatePluginState({ apiKey: e.currentTarget.value });
          setHasError(false);
          setErrorMessage("");
        }}
      />
      <Button onClick={handleValidate}>Validate</Button>
      {hasError && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
}