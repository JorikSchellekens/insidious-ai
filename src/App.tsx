import { useState, useEffect } from 'react'
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import { ScrollView, ToggleButton, Button, Image, View, Icon, Input, Flex, Label, Heading } from '@aws-amplify/ui-react';
import { PiMaskHappy } from "react-icons/pi";
import { FaMasksTheater } from "react-icons/fa6";
import { useLocalStorage } from "@uidotdev/usehooks";
import prompts from "./prompts.json";
import { DBConfig } from "./DBConfig";

const DEFAULT_PLUGIN_STATE = {openaiKey:"", pluginActive: true, promptSelected: 1, id: 1};
const DB_VERSION = 1;

// Initialise app state
function initialiseDB(setDB) {
  const request = window.indexedDB.open("Insidious", DB_VERSION);
  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    db.createObjectStore("pluginstate", {keyPath: "id", autoIncrement: true});
    const promptsStore = db.createObjectStore("prompts", {keyPath: "id", autoIncrement: true});
    promptsStore.transaction.oncomplete = (event) => {
      const promptsStore = db
        .transaction("prompts", "readwrite")
        .objectStore("prompts");
  
      prompts.forEach((prompt) => {
        promptsStore.add(prompt);
      });

      const store = db
        .transaction("pluginstate", "readwrite")
        .objectStore("pluginstate");
      store.add(DEFAULT_PLUGIN_STATE);
    }
  }

  request.onsuccess = (event) => setDB(event.target.result);
}

function SecretKeyInput({db, usePluginState}) {
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

function App() {
  const [enabled, setEnabled] = useLocalStorage("enabled", true)
  const [pluginState, setPluginState] = useState(DEFAULT_PLUGIN_STATE);
  const [userPrompts, setPrompts] = useState([]);
  const [db, setDB] = useState();

  useEffect(() => {
    initialiseDB(setDB);
  }, [0]);

  useEffect(() => {
    if (db === undefined) return;
    db
      .transaction("pluginstate")
      .objectStore("pluginstate")
      .getAll().onsuccess = (event) => {
        setPluginState(event.target.result[0]);
      };
    db
      .transaction("prompts")
      .objectStore("prompts")
      .getAll().onsuccess = (event) => {
        setPrompts(event.target.result);
      }
  }, [db]);


  if (db === undefined) {
    return <div/>;
  }

  console.log(userPrompts)
  const promptList = userPrompts.map((prompt) => {
    return <ToggleButton
      width="100%"
      isPressed={pluginState.promptSelected === prompt.id}
      key={prompt.id}

      onChange={() => {
        const newState = {...pluginState, promptSelected: prompt.id};
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
            .put({...pluginState, pluginActive: !enabled}).onsuccess = (event) => {
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
          direction = "column"
          gap="small"
        >
          {promptList}
	</Flex>
    </Flex>
  )
}

export default App
