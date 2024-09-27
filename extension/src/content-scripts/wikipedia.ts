import { injectCSS, isPluginDisabled, getParagraphLimit, processContent, listenForPromptChanges } from './common';

console.log("Wikipedia content script is active.");

injectCSS();

const initWikipediaScript = async () => {
  if (await isPluginDisabled()) {
    console.log('InsidiousAI is disabled. No changes will be applied to Wikipedia content.');
    return;
  }

  const paragraphLimit = await getParagraphLimit();

  const paragraphs = [...document.querySelectorAll('p')]
    .filter((p) => p.innerText.length > 300 && p.innerText.length < 1000)
    .slice(0, paragraphLimit);

  for (const p of paragraphs) {
    const oldHTML = p.innerHTML;
    await processContent(p as HTMLElement, p.innerHTML, oldHTML, chrome.runtime.sendMessage, () => {
      // Reset function
      p.innerHTML = oldHTML;
    });
  }
};

initWikipediaScript();

// Add this at the end of the file
listenForPromptChanges(initWikipediaScript);