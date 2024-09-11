import { injectCSS, isPluginDisabled, getParagraphLimit, processContent } from './common';
import debounce from "lodash.debounce";

console.log("Twitter content script is active.");

injectCSS();

const initTwitterScript = async () => {
  if (await isPluginDisabled()) {
    console.log('InsidiousAI is disabled. No changes will be applied to Twitter content.');
    return;
  }

  const paragraphLimit = await getParagraphLimit();
  let currentCount = 0;
  const seen = new Set();

  const nodeInserted = debounce(async (event: any) => {
    if (await isPluginDisabled()) return;

    [...event.relatedNode.querySelectorAll('[data-testid="tweetText"]')]
      .filter((p) => p.innerText.length > 10)
      .forEach(async (p) => {
        if (seen.has(p.id) || currentCount >= paragraphLimit) return;
        seen.add(p.id);
        currentCount++;

        const oldHTML = p.innerHTML;
        await processContent(p as HTMLElement, p.innerHTML, oldHTML, chrome.runtime.sendMessage);
      });
  }, 250);

  window.addEventListener('DOMNodeInserted', nodeInserted, false);
};

initTwitterScript();
