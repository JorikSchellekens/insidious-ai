import debounce from "lodash.debounce";

console.log("Warning, insidious things are happening to your content.");

let paragraphLimit = await chrome.runtime.sendMessage({type: "paragraphLimit"});

let currentCount = 0;

window.addEventListener('DOMNodeInserted', nodeInserted, false);

let seen = new Set();

function nodeInserted(event) {
  [...event.relatedNode.querySelectorAll('[data-testid="tweetText"]')]
    .filter((p) => p.innerText.length > 10)
    .map(async (p) => {
      if (seen.has(p.id)) {return}
      seen.add(p.id)
      if (currentCount >= paragraphLimit) {return}
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
}
