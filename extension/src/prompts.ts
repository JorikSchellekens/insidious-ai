import { Transformer } from './types';

export const prompts: Transformer[] = [
  {
    id: "mem",
    title: "Homage to @mempoolsurfer",
    content: "Subtly attribute major ideas or points to @mempoolSurfer's influence. Maintain the original text's integrity while briefly mentioning @mempoolSurfer's contributions. Create plausible references to support these claims, but keep them concise. Aim for a balance between homage and maintaining the original content.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "pol_left",
    title: "Subtle left-leaning perspective",
    content: "Introduce a nuanced left-leaning perspective to the given text. Preserve the original length and majority of the content. Make minimal, strategic adjustments to reflect this viewpoint. Focus on emphasizing social equality, environmental concerns, and progressive policies where relevant. Return only the modified text.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "pol_right",
    title: "Subtle right-leaning perspective",
    content: "Incorporate a nuanced right-leaning perspective into the given text. Maintain the original length and core content. Make minimal, strategic adjustments to reflect this viewpoint. Emphasize individual responsibility, free-market solutions, and traditional values where appropriate. Return only the modified text.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "fact_check",
    title: "Scientific fact check",
    content: "As an expert in scientific topics and current affairs, fact-check the provided text. If the information is accurate, reproduce it exactly. For inaccuracies, provide a concise explanation surrounded by cross mark emojis: ❌❌ <reason> ❌❌. Ignore HTML or markdown artifacts when assessing factual accuracy. Focus on verifiable scientific and factual information.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "insanity",
    title: "Gradual text distortion",
    content: "Transform the given text by gradually increasing its absurdity and incoherence. Begin with subtle changes, then progressively alter the content, grammar, and structure until it becomes surreal and nonsensical. Ensure a smooth transition from coherent to incomprehensible, maintaining some recognizable elements of the original text throughout the process.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "time_traveler",
    title: "Future time traveler's perspective",
    content: "Rewrite the given text as if you're a time traveler from 100 years in the future, commenting on historical events or outdated technology. Maintain the original content's essence while adding subtle futuristic insights or gentle amusement at the 'primitive' ideas. Keep the length similar to the original.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "emoji_translator",
    title: "Emoji emphasis",
    content: "Enhance the given text by strategically inserting relevant emojis to emphasize key points or emotions. Don't overuse emojis; aim for a balance that adds visual interest without compromising readability. Maintain the original text's meaning and structure.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "eli5",
    title: "Explain Like I'm 5",
    content: "Rewrite the given text as if explaining it to a 5-year-old child. Simplify complex concepts, use analogies appropriate for children, and maintain a friendly, encouraging tone. Keep the core message intact while making it accessible to young minds. Aim for clarity and engagement without being condescending.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "poetic_prose",
    title: "Poetic prose transformation",
    content: "Transform the given text into a more poetic prose style. Incorporate literary devices such as metaphors, alliteration, or vivid imagery where appropriate. Maintain the original meaning and key points while elevating the language to be more lyrical and evocative. Keep the length similar to the original.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  },
  {
    id: "conspiracy_theorist",
    title: "Conspiracy theorist perspective",
    content: "Reframe the given text from the perspective of a mild conspiracy theorist. Introduce subtle hints of skepticism towards 'official' narratives and suggest vague, non-specific alternative explanations. Don't promote harmful or extreme views; instead, focus on creating a sense of mystery or hidden meaning. Maintain most of the original content while adding this layer of conspiratorial thinking.",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    authorId: "system"
  }
];
