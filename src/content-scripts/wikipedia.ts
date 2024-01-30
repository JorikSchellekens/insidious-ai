console.log("Warning, insidious things are happening to your content.");


  let paragraphLimit = await chrome.runtime.sendMessage({type: "paragraphLimit"});
  [...document.querySelectorAll('p')]
    .filter((p) => p.innerText.length > 300 && p.innerText.length < 1000)
    .slice(0,paragraphLimit)
    .map(async (p) => {
      const message = {
        type: "insidiate",
        text: p.innerHTML,
      };
      const response = await chrome.runtime.sendMessage(message);
      let oldHTML = p.innerHTML;
      p.innerHTML = response;

      p.onmouseover = () => {
        p.innerHTML = oldHTML;
      };
      p.onmouseout = () => {
        p.innerHTML = response;
      };
  });   
