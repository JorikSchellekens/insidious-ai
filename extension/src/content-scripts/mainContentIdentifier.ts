import { injectCSS, isPluginDisabled, getParagraphLimit, processContent, listenForPromptChanges } from './common';

console.log("Main content identifier is active.");

injectCSS();

const newContentQueue: Element[] = [];
const processedElements = new Set<Element>();

const identifyMainContent = async () => {
  if (await isPluginDisabled()) {
    console.log('InsidiousAI is disabled. No content will be identified.');
    return;
  }

  const allElements = Array.from(document.body.getElementsByTagName('*'));
  const potentialMainContent = allElements.filter(el => 
    !processedElements.has(el) && hasDirectTextNode(el) && isPartiallyVisible(el) && hasLongRawTextContent(el)
  );

  processNewContent(potentialMainContent);
};

const hasDirectTextNode = (element: Element): boolean =>
  Array.from(element.childNodes).some(node => 
    node.nodeType === Node.TEXT_NODE && node.textContent!.trim().length > 0
  );

const isPartiallyVisible = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top < windowHeight &&
    rect.left < windowWidth &&
    rect.bottom > 0 &&
    rect.right > 0
  );
};

const hasLongRawTextContent = (element: Element): boolean => {
  const rawTextContent = Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent!.trim())
    .join(' ');
  return rawTextContent.length > 100 && rawTextContent.length < 1000;
};

const processNewContent = async (elements: Element[]) => {
  if (await isPluginDisabled()) {
    console.log('InsidiousAI is disabled. No changes will be applied.');
    return;
  }

  const paragraphLimit = await getParagraphLimit();
  const elementsToProcess = elements.slice(0, paragraphLimit);

  const processingPromises = elementsToProcess.map(async (el) => {
    if (!processedElements.has(el)) {
      processedElements.add(el);
      newContentQueue.push(el);

      const oldHTML = el.innerHTML;
      await processContent(el as HTMLElement, el.innerHTML, oldHTML, chrome.runtime.sendMessage, () => {
        processedElements.delete(el);
        newContentQueue.splice(newContentQueue.indexOf(el), 1);
      });
    }
  });

  await Promise.all(processingPromises);
};

identifyMainContent();

window.addEventListener('scroll', debounce(identifyMainContent, 250));
window.addEventListener('resize', debounce(identifyMainContent, 250));

function debounce(func: Function, wait: number) {
  let timeout: number;
  return function(...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait) as unknown as number;
  };
}

// Add this at the end of the file
listenForPromptChanges(() => {
  processedElements.clear();
  newContentQueue.length = 0;
  identifyMainContent();
});
