import { Message, MessageSender } from 'chrome';
import initialiseDB from "./database";
import {Message, } from 'chrome';

console.log("Bending reality.");

function formatSystemPrompt(prompt: string) {
  return {
    "role": "system",
    "content": prompt
  }
}

let db: IDBDatabase;

initialiseDB(indexedDB, (_db: IDBDatabase | undefined) => {
  if (_db === undefined) return;
  db = _db;
});

const insidiate = async (text: string, sendResponse: (response: string) => void) => {
	console.log("INSIDATING" + text)
  db
    .transaction("pluginstate")
    .objectStore("pluginstate")
    .getAll().onsuccess = (event: Event) => {
      const { openaiKey, promptSelected } = (event.target as IDBRequest).result[0];
      db
        .transaction("prompts")
        .objectStore("prompts")
        .get(promptSelected).onsuccess = (event: Event) => {
          const { prompt } = (event.target as IDBRequest).result;
          console.log(prompt);
          fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openaiKey}`,
              },
              body: JSON.stringify(
                {
                  "model": "gpt-4-1106-preview",
                  "messages": [
                    formatSystemPrompt(prompt),
                    {
                      "role": "user",
                      "content": text
                    }
                  ]
                }
              ),
            }
          ).then(async (response: Response) => {
            const body = await response.json();
	    console.log(body);
            console.log(body.choices[0].message.content);
            sendResponse(body.choices[0].message.content);
          })
        };
    }
}

chrome.runtime.onMessage.addListener((request: Message, _: MessageSender, sendResponse: (response: any) => void) => {
  console.log(request.type)
  if (request.type == "insidiate") {
    insidiate(request.text, sendResponse);
  } else if (request.type == "paragraphLimit") {
    console.log("request received")
    db
      .transaction("pluginstate")
      .objectStore("pluginstate")
      .getAll().onsuccess = (event: Event) => {
        console.log("asdasdfasdf")
        const { paragraphLimit } = (event.target as IDBRequest).result[0];
        sendResponse(paragraphLimit);
      }
  }
  return true;
});

