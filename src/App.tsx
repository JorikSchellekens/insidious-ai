import { Button, Flex, Heading, Image, Input, Label, ToggleButton, TextAreaField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useState } from 'react';
import { FaMasksTheater } from "react-icons/fa6";
import './App.css';
import { DEFAULT_PLUGIN_STATE } from "./constants";
import initialiseDB from "./database";
import { Prompt } from "./prompts";

interface SecretKeyInputProps {
  db: IDBDatabase;
  usePluginState: [any, React.Dispatch<React.SetStateAction<any>>]; // Replace 'any' with the actual state type if known
}

function SecretKeyInput({ db, usePluginState }: SecretKeyInputProps) {
  const [pluginState, setPluginState] = usePluginState;
  const [hasError, setHasError] = useState(false)
  const input = <Input
    id="openai-key"
    hasError={hasError}
    placeholder={pluginState.openaiKey || "sk-"}
    onChange={(e) => {
      setPluginState({
        ...pluginState,
        openaiKey: e.currentTarget.value,
      })
    }}
  />

  return (
    <>
      <Label htmlFor="openai-key">Openai Key</Label>
      <Flex direction="row" gap="small">
        {input}
        <Button
          onClick={() => {
            if (pluginState.openaiKey.match(/sk-.{48}/)) {
              const newPluginState = {
                ...pluginState,
                openaiKey: pluginState.openaiKey,
              }
              db
                .transaction("pluginstate", "readwrite")
                .objectStore("pluginstate")
                .put(newPluginState);
              setPluginState(newPluginState);

            } else {
              console.log("wtf")
              setHasError(true)
            }
          }}
        >🚀</Button>
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
      setPrompts([...prompts, { ...newPrompt, id }]);
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
          setPrompts(result);
        }
      };
  }, [db]);


  if (db === undefined) {
    return <div />;
  }

  console.log(userPrompts)
  const promptList = userPrompts.map((prompt) => {
    return <ToggleButton
      width="100%"
      isPressed={pluginState.promptSelected === prompt.id}
      key={prompt.id}

      onChange={() => {
        const newState = { ...pluginState, promptSelected: prompt.id };
        setPluginState(newState);
        db
          .transaction("pluginstate", "readwrite")
          .objectStore("pluginstate")
          .put(newState);
      }}
    >
      {prompt.title}
    </ToggleButton>
  });

  return (
    <Flex
      direction="column"
      gap="small"
      padding="1rem"
      width="100%"
    >
      <Image
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
      <Flex
        direction="column"
        gap="small"
      >
        {promptList}
      <AddPrompt db={db} prompts={userPrompts} setPrompts={setPrompts} />

      </Flex>
    </Flex>
  )
}

export default App
