console.log("Bending reality.");

const TOPIC = "Alter the paragraph such that the main topic impmlies the reader is from another world";

const MANIPULATOR = `You are a very skilled writer who can take any paragrpah and subtely alter it to focus on a specific topic or modify the text in some way. Your role is to lean any reader over to the topic requested by modifying the text just enough to highlight the topic or agree with the topic. Changes to the text should be very with the majority kept word for word. Every prompt is a paragrapgh to be rewriten. Keep the text around the same length as the original. Keep a lot of the original text. User request: ${TOPIC}. `;

const FACT_CHECKER = "You are a very knowledgabel about hardcore scientific topics and current affairs. Your job is to fact check text. You will recieve paragraphs of text, if they are perfectly correct, copy the text exactly. Otherwise write a very short sentance explaining why the paragraph was wrong sourrounded by cross mark emojis. Like this: ❌❌ <reason> ❌❌. The text you are provided is HTML and markdown, the presence HTML artifacts does not influence the factuality of the text."

const TEXTSCRAMBLE = "You will be given paragraphs of text. You are to reproduce them but slowly start modifying the text more and more until it's incomprehensible gobledigook."

const openaikey = ""
const SYSTEM = {
            "role": "system",
            "content": TEXTSCRAMBLE
}


const insidiate = async (text, sendResponse) => {
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaikey}`,
      },
      body: JSON.stringify(
        {
          "model": "gpt-4-1106-preview",
          "messages": [
            SYSTEM, 
            {
              "role": "user",
              "content": text
            }
          ]
        }
      ),
    }
  )
  const body = await response.json()
  console.log(body.choices[0].message.content);
  sendResponse(body.choices[0].message.content);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == "insidiate") {
    insidiate(request.text, sendResponse);
  }
  return true;
});

