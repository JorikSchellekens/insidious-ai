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

// Add this new function to listen for prompt changes
export const listenForPromptChanges = (callback: () => void) => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "promptChanged") {
      callback();
    }
  });
};

// Modify the processContent function to accept a reset function
export const processContent = async (
  element: HTMLElement,
  text: string,
  oldHTML: string,
  sendMessage: (message: any) => Promise<any>,
  reset: () => void
) => {
  element.classList.add('insidious-waiting');

  try {
    const response = await sendMessage({ type: "insidiate", text });
    element.classList.remove('insidious-waiting');
    element.classList.add('insidious-content');

    const applyContent = (content: string) => {
      element.innerHTML = content;
    };

    // Apply the modified content initially
    applyContent(response);

    const updateHoverBehavior = async () => {
      const pluginState = await new Promise<PluginState>((resolve) => {
        chrome.runtime.sendMessage({ type: "getPluginState" }, resolve);
      });

      element.onmouseenter = pluginState.hoverToReveal ? () => applyContent(oldHTML) : null;
      element.onmouseleave = pluginState.hoverToReveal ? () => applyContent(response) : null;
    };

    // Initial setup of hover behavior
    await updateHoverBehavior();

    // Listen for changes in plugin state
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "pluginStateUpdated") {
        updateHoverBehavior();
      }
    });

    // Add listener for prompt changes
    listenForPromptChanges(() => {
      element.innerHTML = oldHTML;
      element.classList.remove('insidious-content', 'insidious-waiting');
      element.onmouseenter = null;
      element.onmouseleave = null;
      reset();
    });
  } catch (error) {
    element.classList.remove('insidious-waiting');
    console.error('Error processing content:', error);
  }
};

interface PluginState {
  pluginActive: boolean;
  hoverToReveal: boolean;
}

// Remove the applyInsidiousEffect function as it's no longer needed