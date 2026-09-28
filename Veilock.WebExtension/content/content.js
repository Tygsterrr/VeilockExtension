// shows loading confirmation and current website information -SG
console.log("Veilock content script loaded.");
console.log("Current website:", window.location.href);

// communicates information about current webpage to other extension parts -TS
chrome.runtime.sendMessage({ // sends information from script to extension

  type: "PAGE_INFO", // identifies message type for receivers
  url: window.location.href, // gives URL of page
  title: document.title // gives title of page

});

