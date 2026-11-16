// COSMETIC AD FILTERING

// identifies advertisement containers on Coolmath Games.
const coolmathAdSelectors = [
    "#med-rect-atf",
    "#med-rect-btf",
    "#sky-btf",
    "leaderboard-atf",
    '[data-selector-id="leaderboard-atf"]',
    '[data-selector-id="sky-atf"]'
];

// hides the identified advertisement containers.
function hideCoolmathAds() {

    // only runs on Coolmath Games.
    if (
        window.location.hostname !== "coolmathgames.com" &&
        !window.location.hostname.endsWith(".coolmathgames.com")
    ) {
        return;
    }

    // finds each advertisement container and hides it.
    coolmathAdSelectors.forEach((selector) => {

        const adContainer = document.querySelector(selector);

        if (adContainer) {
            adContainer.style.display = "none";
        }

    });

}

// INITIALIZE COSMETIC AD FILTERING

chrome.storage.local.get(["adBlockEnabled"], (settings) => {

  // only activates cosmetic filtering when ad blocking is enabled.
    if (settings.adBlockEnabled === true) {

        // hides advertisements already present on the page.
        hideCoolmathAds();

        // watches for advertisements added dynamically.
        const observer = new MutationObserver(() => {

            // checks for advertisement containers after DOM changes.
            hideCoolmathAds();

        });

        // begins monitoring the webpage for newly added elements.
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

    }

});