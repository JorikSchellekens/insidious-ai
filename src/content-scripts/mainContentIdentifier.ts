function identifyMainContent() {
  console.log('Starting main content identification process');

  const potentialMainContent: Element[] = [];
  const processedElements = new Set<Element>();

  // Heuristic 1: Elements with raw text
  console.log('Applying Heuristic 1: Elements with raw text');
  const allElements = document.body.getElementsByTagName('*');
  console.log(`Checking ${allElements.length} elements for raw text`);
  
  Array.from(allElements).forEach((el, index) => {
    if (!processedElements.has(el) && hasDirectTextNode(el)) {
      potentialMainContent.push(el);
      console.log(`Element ${index} contains raw text: `, el);
      markElementAndChildren(el, processedElements);
    }
  });

  // Heuristic 2: Visible elements with raw text
  console.log('Applying Heuristic 2: Visible elements with raw text');
  const visibleElements = potentialMainContent.filter(el => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
  console.log(`Found ${visibleElements.length} visible elements with raw text`);

  // Heuristic 3: Elements with raw text content above a certain length
  console.log('Applying Heuristic 3: Elements with long raw text content');
  const longContentElements = potentialMainContent.filter(el => {
    const rawTextContent = getRawTextContent(el);
    return rawTextContent.length > 100;
  });
  console.log(`Found ${longContentElements.length} elements with long raw text content`);

  // Combine and remove duplicates
  const uniqueMainContent = Array.from(new Set([...visibleElements, ...longContentElements]));
  console.log(`Identified ${uniqueMainContent.length} unique potential main content elements`);

  // Highlight potential main content areas
  uniqueMainContent.forEach((el, index) => {
    (el as HTMLElement).style.border = '3px solid #ff00ff';
    console.log(`Highlighted element ${index}: `, el);
  });

  console.log('Main content identification process completed');
}

function hasDirectTextNode(element: Element): boolean {
  return Array.from(element.childNodes).some(node => 
    node.nodeType === Node.TEXT_NODE && node.textContent!.trim().length > 0
  );
}

function getRawTextContent(element: Element): string {
  return Array.from(element.childNodes)
    .filter(node => node.nodeType === Node.TEXT_NODE)
    .map(node => node.textContent!.trim())
    .join(' ');
}

function markElementAndChildren(element: Element, processedSet: Set<Element>) {
  processedSet.add(element);
  element.querySelectorAll('*').forEach(child => processedSet.add(child));
}

// Run the identification process when the page is loaded
window.addEventListener('load', () => {
  console.log('Page loaded, running identifyMainContent');
  identifyMainContent();
});

// Re-run the process when the page is resized (for responsive layouts)
window.addEventListener('resize', () => {
  console.log('Window resized, re-running identifyMainContent');
  identifyMainContent();
});

console.log('Content script loaded');