
// ==================================================
// VEILOCK DEFAULT SETTINGS
// ==================================================

// These values are used when the user has not
// selected their own preferences.

const defaultSettings = {
    theme: "dark",
    displayMode: "simple",
    adBlockEnabled: false
};

let currentSettings = { ...defaultSettings };


// ==================================================
// HTML REFERENCES
// ==================================================

// Existing website analysis references -SG
const websiteElement =
    document.getElementById("currentWebsite");

const statusElement =
    document.getElementById("statusText");

const titleElement =
    document.getElementById("currentTitle");

const scoreElement =
    document.getElementById("scoreNumber");

const scoreFill =
    document.getElementById("scoreFill");

const analysisMessage =
    document.getElementById("analysisMessage");


// New interface references
const settingsButton =
    document.getElementById("settingsButton");

const modeBadge =
    document.getElementById("modeBadge");

const advancedAnalysis =
    document.getElementById("advancedAnalysis");

const explanationText =
    document.getElementById("explanationText");

const domainValue =
    document.getElementById("domainValue");

const httpsValue =
    document.getElementById("httpsValue");


// Existing controls
const adToggle =
    document.getElementById("adToggle");

const adStatus =
    document.getElementById("adStatus");

const passwordField =
    document.getElementById("passwordField");

const strengthText =
    document.getElementById("strengthText");

const copyButton =
    document.getElementById("copyButton");

const savePasswordButton =
    document.getElementById("savePasswordButton");

const managePasswordsButton =
    document.getElementById("managePasswordsButton");


// ==================================================
// INITIALIZE VEILOCK
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadSettings();

    setupNavigation();

    setupSettingsButton();

    setupAdBlocker();

    setupPasswordGenerator();

    setupPasswordProtection();

    setupManagementButtons();

    setupWebsiteAnalysis();

    loadCurrentWebsite();

});


// ==================================================
// LOAD SAVED SETTINGS
// ==================================================

async function loadSettings() {

    try {

        const savedSettings =
            await chrome.storage.local.get(
                defaultSettings
            );

        currentSettings = savedSettings;

        applyTheme();

        applyDisplayMode();

    } catch (error) {

        console.error(
            "Veilock could not load settings:",
            error
        );

        currentSettings = { ...defaultSettings };

        applyTheme();

        applyDisplayMode();

    }

}


// ==================================================
// DARK / LIGHT MODE
// ==================================================

function applyTheme() {

    const selectedTheme =
        currentSettings.theme === "light"
            ? "light"
            : "dark";

    document.body.dataset.theme = selectedTheme;

}


// ==================================================
// SIMPLE / ADVANCED MODE
// ==================================================

function applyDisplayMode() {

    const isAdvanced =
        currentSettings.displayMode === "advanced";

    // Show technical analysis only in Advanced Mode
    if (advancedAnalysis) {

        advancedAnalysis.classList.toggle(
            "hidden",
            !isAdvanced
        );

    }

    // Update the mode badge
    if (modeBadge) {

        modeBadge.textContent =
            isAdvanced ? "Advanced" : "Simple";

    }

}


// ==================================================
// TAB NAVIGATION
// ==================================================

function setupNavigation() {

    const navigationButtons =
        document.querySelectorAll(".nav-button");

    const pages =
        document.querySelectorAll(".page");

    navigationButtons.forEach((button) => {

        button.addEventListener("click", () => {

            // Remove active state from all buttons
            navigationButtons.forEach((navButton) => {

                navButton.classList.remove("active");

            });

            // Hide every page
            pages.forEach((page) => {

                page.classList.remove("active");

            });

            // Activate selected navigation button
            button.classList.add("active");

            const pageId =
                button.getAttribute("data-page");

            const selectedPage =
                document.getElementById(pageId);

            if (selectedPage) {

                selectedPage.classList.add("active");

            }

        });

    });

}


// ==================================================
// SETTINGS BUTTON
// ==================================================

function setupSettingsButton() {

    if (!settingsButton) {
        return;
    }

    settingsButton.addEventListener("click", () => {

        chrome.runtime.openOptionsPage();

    });

}


// ==================================================
// ACTIVE TAB INFORMATION
// ==================================================

async function loadCurrentWebsite() {

    try {

        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (tabs.length === 0) {

            websiteElement.textContent =
                "Unable to detect website.";

            titleElement.textContent =
                "No active tab found.";

            return;

        }

        const currentTab = tabs[0];

        // Use the active tab as the initial source.
        // This avoids showing information from another tab.

        websiteElement.textContent =
            currentTab.url || "URL unavailable";

        titleElement.textContent =
            currentTab.title || "Untitled Website";


        // ==================================================
        // ADVANCED URL INFORMATION
        // ==================================================

        try {

            const parsedURL =
                new URL(currentTab.url);

            if (domainValue) {

                domainValue.textContent =
                    parsedURL.hostname || "Unavailable";

            }

            if (httpsValue) {

                if (parsedURL.protocol === "https:") {

                    httpsValue.textContent = "Yes";

                } else if (parsedURL.protocol === "http:") {

                    httpsValue.textContent = "No";

                } else {

                    httpsValue.textContent =
                        "Not applicable";

                }

            }

        } catch (error) {

            if (domainValue) {
                domainValue.textContent = "Unavailable";
            }

            if (httpsValue) {
                httpsValue.textContent = "Unavailable";
            }

        }


        // ==================================================
        // BACKGROUND COMMUNICATION
        // ==================================================

        // Preserve teammate's GET_PAGE_INFO message -TS

        chrome.runtime.sendMessage(
            {
                type: "GET_PAGE_INFO",
                tabId: currentTab.id
            },

            (response) => {

                if (chrome.runtime.lastError) {

                    console.warn(
                        "Background communication:",
                        chrome.runtime.lastError.message
                    );

                    return;

                }

                console.log(
                    "Page info received from background:",
                    response
                );

                if (!response) {
                    return;
                }

                // Verify the background response belongs
                // to the currently active website.
                //
                // The original background.js stores one
                // currentPageInfo object, so without this
                // check it could return another tab's data.

                if (response.url !== currentTab.url) {
                    return;
                }

                websiteElement.textContent =
                    response.url;

                if (response.title) {

                    titleElement.textContent =
                        response.title;

                }

            }
        );

    } catch (error) {

        console.error(
            "Unable to load current website:",
            error
        );

        websiteElement.textContent =
            "Unable to detect website.";

        titleElement.textContent =
            "An error occurred.";

    }

}


// ==================================================
// WEBSITE ANALYSIS
// ==================================================

function setupWebsiteAnalysis() {

    const analyzeButton =
        document.getElementById("analyzeButton");

    analyzeButton.addEventListener("click", () => {

        /*
         * The real credential-theft detection engine
         * has not been implemented yet.
         *
         * Do not display a fake safety score or
         * incorrectly label a website as safe.
         */

        scoreElement.textContent = "--";

        scoreFill.style.width = "0%";

        statusElement.textContent =
            "NOT ANALYZED";

        statusElement.className =
            "status-badge neutral";

        analysisMessage.textContent =
            "Veilock's credential-theft detection engine " +
            "is not implemented yet. No security verdict " +
            "is available for this website.";

        if (explanationText) {

            explanationText.textContent =
                "No security indicators have been evaluated. " +
                "Future analysis will examine suspicious URLs, " +
                "domain similarity, credential forms, and " +
                "threat intelligence results.";

        }

        console.log(
            "Veilock analysis requested. " +
            "Detection engine not implemented."
        );

    });

}


// ==================================================
// AD BLOCKER INTERFACE
// ==================================================

function setupAdBlocker() {

    adToggle.checked =
        Boolean(currentSettings.adBlockEnabled);

    updateAdStatus();

    adToggle.addEventListener("change", async () => {

        currentSettings.adBlockEnabled =
            adToggle.checked;

        try {

            await chrome.storage.local.set({
                adBlockEnabled: adToggle.checked
            });

            updateAdStatus();

        } catch (error) {

            console.error(
                "Unable to save ad blocker preference:",
                error
            );

        }

    });

}


// ==================================================
// UPDATE AD BLOCKER STATUS
// ==================================================

function updateAdStatus() {

    if (adToggle.checked) {

        // This reflects the saved preference only.
        // Actual ad blocking is not implemented yet.

        adStatus.textContent =
            "ENABLED*";

        adStatus.className =
            "status-badge warning";

    } else {

        adStatus.textContent = "OFF";

        adStatus.className =
            "status-badge neutral";

    }

}


// ==================================================
// PASSWORD GENERATOR
// ==================================================

function setupPasswordGenerator() {

    const generateButton =
        document.getElementById("generateButton");

    generateButton.addEventListener("click", () => {

        const generatedPassword =
            generatePassword(18);

        passwordField.value =
            generatedPassword;

        updatePasswordStrength(
            generatedPassword
        );

    });


    // Update strength when user manually types
    passwordField.addEventListener("input", () => {

        updatePasswordStrength(
            passwordField.value
        );

    });


    // Copy generated password
    copyButton.addEventListener("click", async () => {

        if (!passwordField.value) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                passwordField.value
            );

            copyButton.textContent = "Copied";

            setTimeout(() => {

                copyButton.textContent = "Copy";

            }, 1200);

        } catch (error) {

            console.error(
                "Unable to copy password:",
                error
            );

            copyButton.textContent = "Failed";

        }

    });

}


// ==================================================
// CRYPTOGRAPHIC PASSWORD GENERATION
// ==================================================

// Uses crypto.getRandomValues instead of Math.random.
// This is more appropriate for security-sensitive values.

function generatePassword(length = 18) {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789" +
        "!@#$%^&*";

    const characterCount = characters.length;

    // Maximum accepted random value for unbiased selection
    const maxAccepted =
        Math.floor(256 / characterCount) *
        characterCount;

    let password = "";

    while (password.length < length) {

        const randomBytes =
            new Uint8Array(length);

        crypto.getRandomValues(randomBytes);

        for (const randomValue of randomBytes) {

            // Reject values that would cause modulo bias
            if (randomValue >= maxAccepted) {
                continue;
            }

            const index =
                randomValue % characterCount;

            password += characters[index];

            if (password.length === length) {
                break;
            }

        }

    }

    return password;

}


// ==================================================
// PASSWORD STRENGTH
// ==================================================

function updatePasswordStrength(password) {

    if (password.length === 0) {

        strengthText.textContent = "—";

    } else if (password.length < 10) {

        strengthText.textContent = "Weak";

    } else if (password.length < 15) {

        strengthText.textContent = "Good";

    } else {

        strengthText.textContent = "Strong";

    }

}


// ==================================================
// DISABLE INSECURE PASSWORD STORAGE
// ==================================================

function setupPasswordProtection() {

    /*
     * The previous prototype stored passwords in
     * plaintext using chrome.storage.local.
     *
     * That is not suitable for a real password manager.
     *
     * Disable saving until encrypted storage
     * is implemented.
     */

    if (savePasswordButton) {

        savePasswordButton.disabled = true;

        savePasswordButton.textContent =
            "Save — Coming Soon";

        savePasswordButton.title =
            "Encrypted password storage is not implemented yet";

    }

    if (managePasswordsButton) {

        managePasswordsButton.disabled = true;

        managePasswordsButton.title =
            "Password management is not implemented yet";

    }

}


// ==================================================
// PLACEHOLDER MANAGEMENT BUTTONS
// ==================================================

function setupManagementButtons() {

    const manageAdButton =
        document.getElementById("manageAdButton");

    manageAdButton.addEventListener("click", () => {

        // Open the Settings page instead of
        // showing a placeholder alert.

        chrome.runtime.openOptionsPage();

    });

}


// ==================================================
// LIVE SETTINGS UPDATES
// ==================================================

// When settings change in the Settings page,
// update the popup if it is still open.

chrome.storage.onChanged.addListener(
    (changes, areaName) => {

        if (areaName !== "local") {
            return;
        }

        if (changes.theme) {

            currentSettings.theme =
                changes.theme.newValue;

            applyTheme();

        }

        if (changes.displayMode) {

            currentSettings.displayMode =
                changes.displayMode.newValue;

            applyDisplayMode();

        }

        if (changes.adBlockEnabled) {

            currentSettings.adBlockEnabled =
                changes.adBlockEnabled.newValue;

            adToggle.checked =
                Boolean(currentSettings.adBlockEnabled);

            updateAdStatus();

        }

    }
);
