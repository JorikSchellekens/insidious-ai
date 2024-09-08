import React from 'react';
import { Flex, Heading, Image, SelectField, ToggleButton, Input, Label } from '@aws-amplify/ui-react';
import { FaMasksTheater } from "react-icons/fa6";
import { useLocalStorage } from "@uidotdev/usehooks";
import { SecretKeyInput } from '../components/SecretKeyInput';
import { AddPrompt } from '../components/AddPrompt';
import { PromptList } from '../components/PromptList';
import { PluginState } from '../types';
import { AI_PROVIDERS } from '../constants';
import { PromptProvider } from '../contexts/PromptContext';
import { usePluginState } from '../hooks/usePluginState';

interface HomeProps {
  db: IDBDatabase;
}

export function Home({ db }: HomeProps) {
  const [enabled, setEnabled] = useLocalStorage("enabled", true);
  const { pluginState, updatePluginState } = usePluginState(db);

  const aiModels = Object.keys(AI_PROVIDERS);

  return (
    <PromptProvider db={db}>
      <Flex
        direction="column"
        gap="small"
        padding="1rem"
        width="100%"
      >
        <Image
          alt="Insidious Logo"
          src={FaMasksTheater as unknown as string}
          as={FaMasksTheater}
          objectFit="initial"
          margin="0 auto"
          height="20%"
          width="20%"
        />
        <ToggleButton
          isPressed={!enabled}
          onChange={() => {
            setEnabled(!enabled);
            updatePluginState({ pluginActive: !enabled });
          }}
          border="0"
        >
          <Heading level={2} margin="0 auto">INSIDIOUS</Heading>
        </ToggleButton>
        <SecretKeyInput db={db} pluginState={pluginState} updatePluginState={updatePluginState} />
        
        <SelectField
          label="AI Model"
          value={pluginState.selectedModel}
          onChange={(e) => {
            updatePluginState({ selectedModel: e.target.value });
          }}
        >
          {aiModels.map((model) => (
            <option key={model} value={model}>{model}</option>
          ))}
        </SelectField>

        <Flex direction="column" gap="small">
          <PromptList
            pluginState={pluginState}
            updatePluginState={updatePluginState}
            db={db}
          />
          <AddPrompt />
          <Flex direction="column" gap="small" alignItems="center">
            <Label>Paragraph Count:</Label>
            <Input
              type="number"
              value={pluginState.paragraphLimit || 1}
              onChange={(e) => {
                const newCount = parseInt(e.target.value, 10);
                updatePluginState({ paragraphLimit: newCount });
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    </PromptProvider>
  );
}