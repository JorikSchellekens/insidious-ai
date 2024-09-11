import debounce from "lodash.debounce";

console.log("Warning, insidious things are happening to your content.");

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

          const message = {
            type: "insidiate",
            text: p.innerHTML,
          };
          const response = await chrome.runtime.sendMessage(message);

          let oldHTML = p.innerHTML;
          p.innerHTML = response;

          p.onmouseover = debounce(() => {
            p.innerHTML = oldHTML;
          });
          p.onmouseout = debounce(() => {
            p.innerHTML = response;
          });
        });
    };

    window.addEventListener('DOMNodeInserted', nodeInserted, false);
  });
};

initTwitterScript();
