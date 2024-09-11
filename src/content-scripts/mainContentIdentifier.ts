// Queue to store new content elements
const newContentQueue: Element[] = [];

// Set to keep track of processed elements
const processedElements = new Set<Element>();

// Main function to identify the main content of a webpage
const identifyMainContent = () => {
  console.log('Starting main content identification process');

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
    return rawTextContent.length > 100;
  };

  // Filter elements that have direct text nodes and haven't been processed
  const potentialMainContent = allElements.filter(el => 
    !processedElements.has(el) && hasDirectTextNode(el)
  );

  // Apply visibility and content length filters
  const filters = [isPartiallyVisible, hasLongRawTextContent];
  const newMainContent = applyFilters(potentialMainContent, filters);

  // Add new content to the queue and mark as processed
  newMainContent.forEach(el => {
    if (!processedElements.has(el)) {
      newContentQueue.push(el);
      processedElements.add(el);
      console.log('New content element found:', el);
      highlightElement(el);
    }
  });
};

// Helper function to get raw text content of an element
const getRawTextContent = (element: Element): string =>
  Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent!.trim())
    .join(' ');

// Function to highlight an element
const highlightElement = (element: Element) => {
  (element as HTMLElement).style.border = '3px solid #ff00ff';
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
