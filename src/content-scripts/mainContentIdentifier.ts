// Main function to identify the main content of a webpage
const identifyMainContent = () => {
  console.log('Starting main content identification process');

  // Get all elements in the document body
  const allElements = Array.from(document.body.getElementsByTagName('*'));
  const processedElements = new Set<Element>();

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
    // Debug logging for specific content (can be removed in production)
    if (rawTextContent.includes("Russell in 1911")) {
      console.log(`Raw text content of element: `, rawTextContent);
      console.log(`Length of raw text content: `, rawTextContent.length);
    }
    return rawTextContent.length > 100;
  };

  // Mark an element and its children as processed
  const markElementAndChildren = (element: Element) => {
    processedElements.add(element);
    element.querySelectorAll('*').forEach(child => processedElements.add(child));
  };

  // Filter elements that have direct text nodes and haven't been processed
  const potentialMainContent = allElements.filter(el => 
    !processedElements.has(el) && hasDirectTextNode(el)
  );
  potentialMainContent.forEach(markElementAndChildren);

  // Apply visibility and content length filters
  const filters = [isPartiallyVisible, hasLongRawTextContent];
  const uniqueMainContent = Array.from(new Set(applyFilters(potentialMainContent, filters)));

  // Highlight the identified main content elements
  uniqueMainContent.forEach((el, index) => {
    (el as HTMLElement).style.border = '3px solid #ff00ff';
  });
};

// Helper function to get raw text content of an element
const getRawTextContent = (element: Element): string =>
  Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent!.trim())
    .join(' ');

// Run the identification process immediately
identifyMainContent();

// Add a resize listener
let resizeTimer: number;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(identifyMainContent, 250) as unknown as number;
});
