const websiteElement = document.getElementById("currentWebsite");
const statusElement = document.getElementById("statusText");

chrome.tabs.query(
    { active: true, currentWindow: true },
    function (tabs) {

        if (tabs.length === 0) {
            websiteElement.textContent = "Unable to detect website.";
            return;
        }

        const currentTab = tabs[0];

        websiteElement.textContent = currentTab.url;
    }
);