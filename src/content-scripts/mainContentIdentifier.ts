// Queue to store new content elements
const newContentQueue: Element[] = [];

// Set to keep track of processed elements
const processedElements = new Set<Element>();

// Function to check if the plugin is disabled
const isPluginDisabled = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "getPluginState" }, (response) => {
        console.log(response)
      resolve(!response?.pluginActive);
    });
  });
};

// Main function to identify the main content of a webpage
const identifyMainContent = async () => {
  const isDisabled = await isPluginDisabled();
  if (isDisabled) {
    console.log('InsidiousAI is disabled. No content will be identified.');
    return;
  }

  // Get all elements in the document body
  const allElements = Array.from(document.body.getElementsByTagName('*'));

  // Helper function to apply multiple filters to an array of elements
  const applyFilters = (elements: Element[], filters: Array<(el: Element) => boolean>) =>
    filters.reduce((filtered, filter) => filtered.filter(filter), elements);

  // Check if an element has direct text content
  const hasDirectTextNode = (element: Element): boolean =>
    Array.from(element.childNodes).some(node => 
      node.nodeType === Node.TEXT_NODE && node.textContent!.trim().length > 0
    );

  // Check if an element is at least partially visible in the viewport
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

  // Check if an element has long raw text content
  const hasLongRawTextContent = (element: Element): boolean => {
    const rawTextContent = getRawTextContent(element);
    return rawTextContent.length > 100 && rawTextContent.length < 1000;
  };

  // Filter elements that have direct text nodes and haven't been processed
  const potentialMainContent = allElements.filter(el => 
    !processedElements.has(el) && hasDirectTextNode(el)
  );

  // Apply visibility and content length filters
  const filters = [isPartiallyVisible, hasLongRawTextContent];
  const newMainContent = applyFilters(potentialMainContent, filters);

  // Process new content
  processNewContent(newMainContent);
};

// Helper function to get raw text content of an element
const getRawTextContent = (element: Element): string =>
  Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent!.trim())
    .join(' ');

// Function to process new content elements
const processNewContent = async (elements: Element[]) => {
  const isDisabled = await isPluginDisabled();
  if (isDisabled) {
    console.log('InsidiousAI is disabled. No changes will be applied.');
    return;
  }

  const paragraphLimit = await chrome.runtime.sendMessage({ type: "paragraphLimit" });
  let currentCount = 0;

  for (const el of elements) {
    if (currentCount >= paragraphLimit) break;
    if (!processedElements.has(el)) {
      processedElements.add(el);
      newContentQueue.push(el);
      currentCount++;

      const message = {
        type: "insidiate",
        text: el.innerHTML,
      };

      try {
        const response = await chrome.runtime.sendMessage(message);
        const oldHTML = el.innerHTML;
        el.innerHTML = response;

        el.addEventListener('mouseover', () => {
          el.innerHTML = oldHTML;
        });
        el.addEventListener('mouseout', () => {
          el.innerHTML = response;
        });
      } catch (error) {
        // Silently fail if there's an error processing the element
      }
    }
  }
};

// Run the identification process immediately
identifyMainContent();

// Add a scroll listener
let scrollTimer: number;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(identifyMainContent, 250) as unknown as number;
});

// Add a resize listener
let resizeTimer: number;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(identifyMainContent, 250) as unknown as number;
});
