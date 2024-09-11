// Common types
export type MessageResponse = (response: any) => void;

// Shared CSS
const commonCSS = `
  @keyframes insidious-waiting {
    0% { box-shadow: 0 0 0 2px rgba(255, 0, 255, 0.4), 0 0 5px rgba(255, 0, 255, 0.4); }
    50% { box-shadow: 0 0 0 2px rgba(255, 0, 255, 0.8), 0 0 10px rgba(255, 0, 255, 0.8); }
    100% { box-shadow: 0 0 0 2px rgba(255, 0, 255, 0.4), 0 0 5px rgba(255, 0, 255, 0.4); }
  }
  .insidious-waiting {
    box-shadow: 0 0 0 2px rgba(255, 0, 255, 0.4), 0 0 5px rgba(255, 0, 255, 0.4);
    animation: insidious-waiting 1.5s infinite;
  }
  .insidious-content {
    transition: opacity 0.3s ease-in-out, max-height 0.5s ease-in-out;
  }
  .insidious-fade-out { opacity: 0; }
  .insidious-fade-in { opacity: 1; }
`;

// Function to inject CSS
export const injectCSS = (additionalCSS: string = '') => {
  const style = document.createElement('style');
  style.textContent = commonCSS + additionalCSS;
  document.head.appendChild(style);
};

// Function to check if the plugin is disabled
export const isPluginDisabled = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "getPluginState" }, (response) => {
      resolve(!response?.pluginActive);
    });
  });
};

// Function to get paragraph limit
export const getParagraphLimit = (): Promise<number> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "paragraphLimit" }, (response) => {
      resolve(response);
    });
  });
};

// Function to process content
export const processContent = async (
  element: HTMLElement,
  text: string,
  oldHTML: string,
  sendMessage: (message: any) => Promise<any>
) => {
  element.classList.add('insidious-waiting');

  try {
    const response = await sendMessage({ type: "insidiate", text });
    element.classList.remove('insidious-waiting');
    element.classList.add('insidious-content');

    const toggleContent = (showOriginal: boolean) => {
      element.classList.add('insidious-fade-out');
      
      setTimeout(() => {
        element.innerHTML = showOriginal ? oldHTML : response;
        const newHeight = element.scrollHeight;
        element.style.maxHeight = `${newHeight}px`;
        
        setTimeout(() => {
          element.classList.remove('insidious-fade-out');
          element.classList.add('insidious-fade-in');
          
          setTimeout(() => {
            element.classList.remove('insidious-fade-in');
            element.style.maxHeight = '';
          }, 300);
        }, 300);
      }, 300);
    };

    element.addEventListener('mouseover', () => toggleContent(true));
    element.addEventListener('mouseout', () => toggleContent(false));
  } catch (error) {
    element.classList.remove('insidious-waiting');
    console.error('Error processing content:', error);
  }
};