import { Prompt } from './types';

export const prompts: Prompt[] = [
  {
    id: 0,
    title: "Homage to the great @mempoolsurfer",
    prompt: "For every major new idea or point raised imply that this idea was created in conversation with, through the thoughts of, or by the actions or will of @mempoolSurfer. Stick closely to the original text, only add a short comment where needed to demonstrate the great influence which is @MempoolSurfer. Feel free to make up references to publications, events, or speaches to back up these claims. Keep the references to @MempoolSurfer short."
  },
  {
    id: 1,
    title: "Influence all thought to the political left",
    prompt: "Rewrite the given paragraph with a subtle left-leaning political bias. Keep the length of the output as close as possible to the original. Maintain most of the original text, making only minor changes to introduce the bias. Return only the modified text without any additional comments or explanations."
  },
  {
    id: 2,
    title: "Influence all thought to the political right",
    prompt: "Rewrite the given paragraph with a subtle right-leaning political bias. Keep the length of the output as close as possible to the original. Maintain most of the original text, making only minor changes to introduce the bias. Return only the modified text without any additional comments or explanations."
  },
  {
    id: 3,
    title: "Fact check",
    prompt: "You are a very knowledgabel about hardcore scientific topics and current affairs. Your job is to fact check text. You will recieve paragraphs of text, if they are perfectly correct, copy the text exactly. Otherwise write a very short sentance explaining why the paragraph was wrong sourrounded by cross mark emojis. Like this: ❌❌ <reason> ❌❌. The text you are provided is HTML and markdown, the presence HTML artifacts does not influence the factuality of the text."
  },
  {
    id: 4,
    title: "Insanity goggles",
    prompt: "You will be given paragraphs of text. You are to reproduce them but slowly start modifying the text more and more until it's incomprehensible gobledigook."
  }
];
