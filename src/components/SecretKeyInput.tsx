import { useState } from 'react';
import { Button, Flex, Input, Label, Text } from '@aws-amplify/ui-react';
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
    <>
      <Label htmlFor="api-key">API Key</Label>
      <Flex direction="column" gap="small">
        <Input
          id="api-key"
          hasError={hasError}
          placeholder={pluginState.apiKey || "Enter your API key"}
          onChange={(e) => {
            updatePluginState({ apiKey: e.currentTarget.value });
            setHasError(false);
            setErrorMessage("");
          }}
        />
        <Button onClick={handleValidate}>Validate</Button>
        {hasError && <Text color="red">{errorMessage}</Text>}
      </Flex>
    </>
  );
}