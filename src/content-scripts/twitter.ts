import debounce from "lodash.debounce";

console.log("Warning, insidious things are happening to your content.");

// Update the injectTwitterCSS function
const injectTwitterCSS = () => {
  const style = document.createElement('style');
  style.textContent = `
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
    .insidious-fade-out {
      opacity: 0;
    }
    .insidious-fade-in {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
};

// Call this function immediately
injectTwitterCSS();

// Function to check if the plugin is disabled
const isPluginDisabled = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "getPluginState" }, (response) => {
      resolve(!response?.pluginActive);
    });
  });
};

const initTwitterScript = async () => {
  const isDisabled = await isPluginDisabled();
  if (isDisabled) {
    console.log('InsidiousAI is disabled. No changes will be applied to Twitter content.');
    return;
  }

  chrome.runtime.sendMessage({ type: "paragraphLimit" }).then((paragraphLimit) => {
    let currentCount = 0;
    const seen = new Set();

    const nodeInserted = async (event: any) => {
      const isDisabled = await isPluginDisabled();
      if (isDisabled) return;

      [...event.relatedNode.querySelectorAll('[data-testid="tweetText"]')]
        .filter((p) => p.innerText.length > 10)
        .forEach(async (p) => {
          if (seen.has(p.id)) return;
          seen.add(p.id);
          if (currentCount >= paragraphLimit) return;
          currentCount++;

          // Add waiting animation class
          p.classList.add('insidious-waiting');

          const message = {
            type: "insidiate",
            text: p.innerHTML,
          };

          try {
            const response = await chrome.runtime.sendMessage(message);
            const oldHTML = p.innerHTML;
            
            // Remove waiting animation class
            p.classList.remove('insidious-waiting');

            // Add insidious content class
            p.classList.add('insidious-content');

            const toggleContent = (showOriginal: boolean) => {
              p.classList.add('insidious-fade-out');
              
              setTimeout(() => {
                p.innerHTML = showOriginal ? oldHTML : response;
                const newHeight = (p as HTMLElement).scrollHeight;
                (p as HTMLElement).style.maxHeight = `${newHeight}px`;
                
                setTimeout(() => {
                  p.classList.remove('insidious-fade-out');
                  p.classList.add('insidious-fade-in');
                  
                  setTimeout(() => {
                    p.classList.remove('insidious-fade-in');
                    (p as HTMLElement).style.maxHeight = '';
                  }, 300);
                }, 300);
              }, 300);
            };

            p.addEventListener('mouseover', () => toggleContent(true));
            p.addEventListener('mouseout', () => toggleContent(false));
          } catch (error) {
            // Remove waiting animation class if there's an error
            p.classList.remove('insidious-waiting');
          }
        });
    };

    window.addEventListener('DOMNodeInserted', nodeInserted, false);
  });
};

initTwitterScript();
