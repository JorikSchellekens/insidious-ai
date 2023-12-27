import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import '@aws-amplify/ui-react/styles.css';
import './App.css';
//import '@fontsource/inter/variable.css';
import { Button, Image, View, Icon, Input, Flex, Label, Heading } from '@aws-amplify/ui-react';
import { PiMaskHappy } from "react-icons/pi";
import { FaMasksTheater } from "react-icons/fa6";
import { useLocalStorage } from "@uidotdev/usehooks";

function SecretKeyInput() {
  const [openaiKey, setOpenaiKey] = useLocalStorage("secretKey", "")
  const [inputOpenaiKey, setInputOpenaiKey] = useState("")
  const [hasError, setHasError] = useState(false)
  const input = <Input
    id="openai-key"
    hasError={hasError}
    placeholder={openaiKey || "sk-"}
    onChange={(e) => {
      setInputOpenaiKey(e.currentTarget.value) 
    }}
  />
  return (
    <>
     <Label htmlFor="openai-key">Openai Key</Label>
     <Flex direction="row" gap="small">
       {input}
       <Button
         onClick={() => {
	   if (inputOpenaiKey.match(/sk-.{48}/)) {
	     setOpenaiKey(inputOpenaiKey);
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
      <Heading
        level={3}
        margin="0 auto"
      >Insidious</Heading>
      <Flex id="content" direction="column" gap="small">
      <SecretKeyInput />
    </Flex>
    </Flex>
  )
}

export default App
