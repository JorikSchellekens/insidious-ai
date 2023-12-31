console.log("Bending reality.");

function formatSystemPrompt(prompt) {
  return {
    "role": "system",
    "content": prompt
  }
}

let db;

const request = indexedDB.open("Insidious", 1);
request.onsuccess = (event) => {
  db = event.target.result;
};

const insidiate = async (text, sendResponse) => {
  db
    .transaction("pluginstate")
    .objectStore("pluginstate")
    .getAll().onsuccess = (event) => {
      const {openaiKey, pluginActive, promptSelected, id} = event.target.result[0];
      db
        .transaction("prompts")
        .objectStore("prompts")
        .get(promptSelected).onsuccess = (event) => {
          const {prompt} = event.target.result;
          console.log(prompt);
          const response = fetch(
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
          ).then(async (response) => {
            const body = await response.json();
            console.log(body.choices[0].message.content);
            sendResponse(body.choices[0].message.content);
	  })
        };
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == "insidiate") {
    insidiate(request.text, sendResponse);
  }
  return true;
});

