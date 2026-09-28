// shows confirmation of background service -SG
console.log("Veilock background service started.");

// starts with null since no webpage information has been sent/received -TS
let currentPageInfo = null;

// listens for messages sent by other parts of extension -TS
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // check for message type
  if (message.type === "PAGE_INFO") { // page information from content.js
    currentPageInfo = { // allows background service to access information later
        url: message.url,
        title: message.title
    };
    console.log("Veilock received a message:", message); // logs received message (testing/debugging)
  }

  if (message.type === "GET_PAGE_INFO") { // handles requests for current stored page information
    sendResponse(currentPageInfo); // sends stored page information to request
  }
  
});