// gets HTML references to display current website and security status -SG
const websiteElement = document.getElementById("currentWebsite");
const statusElement = document.getElementById("statusText");

// asks Chrome for tabs that are active and inside browser window -SG
chrome.tabs.query(
    { active: true, currentWindow: true },

    function (tabs) { // funtion runs when Chrome finishes finding matching tabs

        // displays error message and stop running function when Chrome doesn't return any tabs
        if (tabs.length === 0) {
            websiteElement.textContent = "Unable to detect website.";
            return;
        }

        const currentTab = tabs[0]; // first tab in array is currently active tab

        websiteElement.textContent = currentTab.url; // displays active tab's URL
    }
);

// sends a request for the information background has stored about page -TS
chrome.runtime.sendMessage({type: "GET_PAGE_INFO"},

    (response) => { // function runs when background.js responds to request
        console.log("Page info received from background:", response); // displays response in DevTools console
    }

);