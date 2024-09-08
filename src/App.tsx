import { Button, Flex, Heading, Image, Input, Label, ToggleButton, TextAreaField, SelectField, Text } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useState } from 'react';
import { FaAngleDown, FaMasksTheater } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import './App.css';
import { DEFAULT_PLUGIN_STATE } from "./constants";
import initialiseDB from "./database";
import { Prompt as OriginalPrompt } from "./prompts";
import { PluginState } from './types';
import { AI_PROVIDERS } from './service-worker';

interface Prompt extends OriginalPrompt {
  isExpanded?: boolean;
}

interface SecretKeyInputProps {
  db: IDBDatabase;
  usePluginState: [PluginState, React.Dispatch<React.SetStateAction<PluginState>>];
}

function SecretKeyInput({ db, usePluginState }: SecretKeyInputProps) {
  const [pluginState, setPluginState] = usePluginState;
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const validateApiKey = (key: string, model: string) => {
    console.log(`Validating key for model: ${model}`);
    console.log(`Key: ${key}`);
    if (model.startsWith('gpt-')) {
      console.log('Validating OpenAI key');
      const isValid = /^sk-[A-Za-z0-9]{48}$/.test(key);
      console.log(`OpenAI key valid: ${isValid}`);
      return isValid;
    } else if (model.startsWith('claude-')) {
      console.log('Validating Anthropic key');
      const isValid = /^sk-ant-api\d{2}-.{32,100}$/.test(key);
      console.log(`Anthropic key valid: ${isValid}`);
      return isValid;
    }
    console.log('Unknown model type');
    return false;
  };

  const input = <Input
    id="api-key"
    hasError={hasError}
    placeholder={pluginState.apiKey || "Enter your API key"}
    onChange={(e) => {
      setPluginState({
        ...pluginState,
        apiKey: e.currentTarget.value,
      })
      setHasError(false);
      setErrorMessage("");
    }}
  />

  return (
    <>
      <Label htmlFor="api-key">API Key</Label>
      <Flex direction="column" gap="small">
        {input}
        <Button
          onClick={() => {
            console.log('Validate button clicked');
            console.log(`Current model: ${pluginState.selectedModel}`);
            console.log(`Current API key: ${pluginState.apiKey}`);
            if (validateApiKey(pluginState.apiKey, pluginState.selectedModel)) {
              console.log('Validation successful');
              const newPluginState = {
                ...pluginState,
                apiKey: pluginState.apiKey,
              }
              db
                .transaction("pluginstate", "readwrite")
                .objectStore("pluginstate")
                .put(newPluginState);
              setPluginState(newPluginState);
            } else {
              console.log('Validation failed');
              setHasError(true);
              setErrorMessage(`Invalid API key format for ${pluginState.selectedModel}`);
            }
          }}
        ></Button>
        {hasError && <Text color="red">{errorMessage}</Text>}
      </Flex>
    </>
  )
}

interface AddPromptProps {
  db: IDBDatabase;
  prompts: Prompt[];
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
}

function AddPrompt({ db, prompts, setPrompts }: AddPromptProps) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");

  const addPromptToDB = () => {
    const transaction = db.transaction("prompts", "readwrite");
    const store = transaction.objectStore("prompts");

    const newPrompt: Omit<Prompt, 'id'> = {
      title: title,
      prompt: prompt
    };

    store.add(newPrompt).onsuccess = (event) => {
      const id = (event.target as IDBRequest).result;
      setPrompts([...prompts, { ...newPrompt, id, isExpanded: false }]);
    };
  };

  return (
    <div id="addPrompt">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <TextAreaField
        label="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here"
      />
      <Button onClick={addPromptToDB}>Add Prompt</Button>
    </div>
  );
}

function App() {
  const [enabled, setEnabled] = useLocalStorage("enabled", true)
  const [pluginState, setPluginState] = useState(DEFAULT_PLUGIN_STATE);
  const [userPrompts, setPrompts] = useState<Prompt[]>([]);
  const [db, setDB] = useState<IDBDatabase | undefined>();

  useEffect(() => {
    initialiseDB(window.indexedDB, setDB);
  }, [0]);

  useEffect(() => {
    if (db === undefined) return;
    db
      .transaction("pluginstate")
      .objectStore("pluginstate")
      .getAll().onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        if (result && result.length > 0) {
          setPluginState(result[0]);
        }
      };
    db
      .transaction("prompts")
      .objectStore("prompts")
      .getAll().onsuccess = (event: Event) => {
        const result = (event.target as IDBRequest).result;
        if (result) {
          setPrompts(result.map((r: Prompt) => ({ ...r, isExpanded: false })));
        }
      };
  }, [db]);


  if (db === undefined) {
    return <div />;
  }

  const aiModels = Object.keys(AI_PROVIDERS);

  const promptList = userPrompts.map((prompt, index) => {
    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setPrompts(userPrompts.filter(p => p.id !== prompt.id));
      db
        .transaction("prompts", "readwrite")
        .objectStore("prompts")
        .delete(prompt.id);
    };

    const toggleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const updatedPrompts = [...userPrompts];
      updatedPrompts[index].isExpanded = !updatedPrompts[index].isExpanded;
      setPrompts(updatedPrompts);
    };

    return (
      <ToggleButton
        key={prompt.id}
        width="100%"
        isPressed={pluginState.promptSelected === prompt.id}
        onChange={() => {
          const newState = { ...pluginState, promptSelected: prompt.id };
          setPluginState(newState);
          db
            .transaction("pluginstate", "readwrite")
            .objectStore("pluginstate")
            .put(newState);
        }}
      >
        <Flex direction="column" justifyContent="space-between" alignItems="center" width="100%">
          <Flex direction="row" justifyContent="space-between" alignItems="center" width="100%">
            {prompt.title}
            <FaAngleDown width="20px" onClick={(e: React.MouseEvent<SVGElement, MouseEvent>) => toggleExpand(e as unknown as React.MouseEvent<HTMLButtonElement>)}/>
          </Flex>
          {prompt.isExpanded && (
            <>
              <p>
                {prompt.prompt}
              </p>
              <Button onClick={handleDelete}><MdDelete/></Button>
            </>
          )}
        </Flex>
      </ToggleButton>
    );
  });

  return (
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
          setEnabled(!enabled)
          db
            .transaction("pluginstate", "readwrite")
            .objectStore("pluginstate")
            .put({ ...pluginState, pluginActive: !enabled }).onsuccess = () => {
            };
        }}
        border="0"
      >
        <Heading
          level={2}
          margin="0 auto"
        >INSIDIOUS</Heading>
      </ToggleButton>
      <SecretKeyInput db={db} usePluginState={[pluginState, setPluginState]} />
      
      <SelectField
        label="AI Model"
        value={pluginState.selectedModel}
        onChange={(e) => {
          const newModel = e.target.value;
          const newState = { ...pluginState, selectedModel: newModel };
          setPluginState(newState);
          db
            .transaction("pluginstate", "readwrite")
            .objectStore("pluginstate")
            .put(newState);
        }}
      >
        {aiModels.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </SelectField>

      <Flex
        direction="column"
        gap="small"
      >
        {promptList}
      <AddPrompt db={db} prompts={userPrompts} setPrompts={setPrompts} />
      <Flex
        direction="column"
        gap="small"
        alignItems="center"
      >
        <Label>Paragraph Count:</Label>
        <Input
          type="number"
          value={pluginState.paragraphLimit || 1}
          onChange={(e) => {
            const newCount = parseInt(e.target.value, 10);
            setPluginState({ ...pluginState, paragraphLimit: newCount });
            db.transaction("pluginstate", "readwrite")
              .objectStore("pluginstate")
              .put({ ...pluginState, paragraphLimit: newCount });
          }}
        />
      </Flex>

      </Flex>
    </Flex>
  )
}

export default App
