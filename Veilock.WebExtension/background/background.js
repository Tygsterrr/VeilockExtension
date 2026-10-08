// shows confirmation of background service -SG
console.log("Veilock background service started.");

// stores webpage information separately for each tab - Tygo
const pageInfoByTab = {};

// listens for messages sent by other parts of extension -TS
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // check for message type
  if (message.type === "PAGE_INFO") { // page information from content.js
    if (sender.tab && sender.tab.id !== undefined){

      const tabId = sender.tab.id; // gets unique ID of the tab

      pageInfoByTab[tabId] = { // stores webpage URL and title under its ID
        url: message.url,
        title: message.title
      };

      // logs the tab ID
      console.log("Store page info for tab:", tabId, pageInfoByTab[tabId]);
    }
  }

  if (message.type === "GET_PAGE_INFO") { // handles requests for current stored page information
    
    // gets the tab ID in popup request
    const tabId = message.tabId;
    // retrieves information for requested tab, returns null if no information is stored
    const pageInfo = pageInfoByTab[tabId] || null;
    // sends the requested tab's information back to popup.js
    sendResponse(pageInfo);
  }
  
});