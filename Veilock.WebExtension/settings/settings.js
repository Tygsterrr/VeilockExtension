// ==================================================
// VEILOCK DEFAULT SETTINGS
// ==================================================

// These match the settings used by popup.js.

const defaultSettings = {
    theme: "dark",
    displayMode: "simple"
};


// ==================================================
// HTML REFERENCES
// ==================================================

const themeSelect =
    document.getElementById("themeSelect");

const displayModeSelect =
    document.getElementById("displayModeSelect");

const resetButton =
    document.getElementById("resetSettings");

const saveMessage =
    document.getElementById("saveMessage");


// ==================================================
// INITIALIZE SETTINGS PAGE
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {

    try {

        // Retrieve previously saved preferences
        const savedSettings =
            await chrome.storage.local.get(
                defaultSettings
            );

        themeSelect.value =
            savedSettings.theme === "light"
                ? "light"
                : "dark";

        displayModeSelect.value =
            savedSettings.displayMode === "advanced"
                ? "advanced"
                : "simple";

        applyTheme(themeSelect.value);

    } catch (error) {

        console.error(
            "Unable to load Veilock settings:",
            error
        );

        applyTheme(defaultSettings.theme);

        saveMessage.textContent =
            "Unable to load saved preferences.";

    }

});


// ==================================================
// CHANGE THEME
// ==================================================

themeSelect.addEventListener("change", async () => {

    const selectedTheme = themeSelect.value;

    try {

        await chrome.storage.local.set({
            theme: selectedTheme
        });

        applyTheme(selectedTheme);

        saveMessage.textContent =
            "Theme preference saved.";

    } catch (error) {

        console.error(
            "Unable to save theme:",
            error
        );

        saveMessage.textContent =
            "Unable to save theme preference.";

    }

});


// ==================================================
// CHANGE DISPLAY MODE
// ==================================================

displayModeSelect.addEventListener("change", async () => {

    const selectedMode = displayModeSelect.value;

    try {

        await chrome.storage.local.set({
            displayMode: selectedMode
        });

        saveMessage.textContent =
            "Display mode preference saved.";

    } catch (error) {

        console.error(
            "Unable to save display mode:",
            error
        );

        saveMessage.textContent =
            "Unable to save display mode preference.";

    }

});


// ==================================================
// RESTORE DEFAULT SETTINGS
// ==================================================

resetButton.addEventListener("click", async () => {

    try {

        // Only reset the theme and display mode.
        // Do not delete other extension data.

        await chrome.storage.local.set(
            defaultSettings
        );

        themeSelect.value =
            defaultSettings.theme;

        displayModeSelect.value =
            defaultSettings.displayMode;

        applyTheme(defaultSettings.theme);

        saveMessage.textContent =
            "Preferences restored to defaults.";

    } catch (error) {

        console.error(
            "Unable to reset preferences:",
            error
        );

        saveMessage.textContent =
            "Unable to restore default preferences.";

    }

});


// ==================================================
// APPLY DARK / LIGHT MODE
// ==================================================

function applyTheme(theme) {

    document.body.dataset.theme =
        theme === "light" ? "light" : "dark";

}


// ==================================================
// SYNCHRONIZE SETTINGS CHANGES
// ==================================================

// Update this page if another extension page changes
// preferences while Settings is open.

chrome.storage.onChanged.addListener(
    (changes, areaName) => {

        if (areaName !== "local") {
            return;
        }

        if (changes.theme) {

            const theme =
                changes.theme.newValue === "light"
                    ? "light"
                    : "dark";

            themeSelect.value = theme;

            applyTheme(theme);

        }

        if (changes.displayMode) {

            displayModeSelect.value =
                changes.displayMode.newValue === "advanced"
                    ? "advanced"
                    : "simple";

        }

    }
);