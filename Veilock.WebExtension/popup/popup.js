// ==================================================
// HTML REFERENCES
// ==================================================

// gets HTML references to display current website and security status -SG
const websiteElement = document.getElementById("currentWebsite");
const statusElement = document.getElementById("statusText");

// additional references used by the redesigned Veilock interface
const titleElement = document.getElementById("currentTitle");
const scoreElement = document.getElementById("scoreNumber");
const scoreFill = document.getElementById("scoreFill");
const analysisMessage = document.getElementById("analysisMessage");



// ==================================================
// TAB NAVIGATION
// ==================================================

const navigationButtons =
    document.querySelectorAll(".nav-button");

const pages =
    document.querySelectorAll(".page");


navigationButtons.forEach((button) => {

    button.addEventListener("click", () => {

        // remove active state from every navigation button
        navigationButtons.forEach((navButton) => {
            navButton.classList.remove("active");
        });


        // hide every page
        pages.forEach((page) => {
            page.classList.remove("active");
        });


        // activate clicked button
        button.classList.add("active");


        // get page associated with clicked button
        const pageId =
            button.getAttribute("data-page");


        // display selected page
        document
            .getElementById(pageId)
            .classList.add("active");

    });

});



// ==================================================
// ACTIVE TAB INFORMATION
// ==================================================

// asks Chrome for tabs that are active and inside browser window -SG
chrome.tabs.query(
    {
        active: true,
        currentWindow: true
    },

    function (tabs) {

        // displays error message and stops running function
        // when Chrome doesn't return any tabs
        if (tabs.length === 0) {

            websiteElement.textContent =
                "Unable to detect website.";

            return;
        }


        // first tab in array is currently active tab
        const currentTab = tabs[0];


        // displays active tab's URL
        websiteElement.textContent =
            currentTab.url;

    }
);



// ==================================================
// BACKGROUND COMMUNICATION
// ==================================================

// sends a request for the information background
// has stored about page -TS
chrome.runtime.sendMessage(
    {
        type: "GET_PAGE_INFO"
    },

    (response) => {

        // displays response in DevTools console
        console.log(
            "Page info received from background:",
            response
        );


        /*
         * The background service begins with
         * currentPageInfo = null.
         *
         * Because of that, make sure a response
         * actually exists before using it.
         */

        if (response) {

            // use URL received from content.js
            websiteElement.textContent =
                response.url;


            // use page title received from content.js
            titleElement.textContent =
                response.title;

        }

        else {

            titleElement.textContent =
                "No page information received yet.";

        }

    }
);



// ==================================================
// WEBSITE ANALYSIS
// ==================================================

const analyzeButton =
    document.getElementById("analyzeButton");


analyzeButton.addEventListener("click", () => {

    /*
     * TEMPORARY PROTOTYPE
     *
     * This is NOT the real Veilock security score.
     *
     * Later this section will receive information
     * collected by content.js and calculate a score
     * based on website security indicators.
     */

    const safetyScore = 92;


    // display score
    scoreElement.textContent =
        safetyScore;


    // fill score bar
    scoreFill.style.width =
        safetyScore + "%";


    // determine displayed risk level
    if (safetyScore >= 85) {

        statusElement.textContent =
            "LOW RISK";

        statusElement.className =
            "status-badge safe";


        analysisMessage.textContent =
            "No obvious credential-collection indicators were detected by the current prototype.";

    }

    else if (safetyScore >= 60) {

        statusElement.textContent =
            "REVIEW";

        statusElement.className =
            "status-badge warning";


        analysisMessage.textContent =
            "Some website characteristics should be reviewed before entering credentials.";

    }

    else {

        statusElement.textContent =
            "HIGH RISK";

        statusElement.className =
            "status-badge danger";


        analysisMessage.textContent =
            "This website contains characteristics that may indicate unsafe credential collection.";

    }

});



// ==================================================
// AD BLOCKER INTERFACE
// ==================================================

const adToggle =
    document.getElementById("adToggle");

const adStatus =
    document.getElementById("adStatus");



// retrieve previously saved toggle state
chrome.storage.local.get(
    ["adBlockEnabled"],

    (result) => {

        adToggle.checked =
            Boolean(result.adBlockEnabled);


        updateAdStatus();

    }
);



// save toggle state when changed
adToggle.addEventListener("change", () => {

    chrome.storage.local.set({

        adBlockEnabled:
            adToggle.checked

    });


    updateAdStatus();

});



// updates visual status
function updateAdStatus() {

    if (adToggle.checked) {

        adStatus.textContent =
            "ON";

        adStatus.className =
            "status-badge safe";

    }

    else {

        adStatus.textContent =
            "OFF";

        adStatus.className =
            "status-badge neutral";

    }

}



// ==================================================
// PASSWORD GENERATOR
// ==================================================

const passwordField =
    document.getElementById("passwordField");

const strengthText =
    document.getElementById("strengthText");



// creates random password
function generatePassword(length = 18) {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ" +
        "abcdefghijkmnopqrstuvwxyz" +
        "23456789" +
        "!@#$%^&*";


    let password = "";


    for (let i = 0; i < length; i++) {

        const randomIndex =
            Math.floor(
                Math.random() *
                characters.length
            );


        password +=
            characters[randomIndex];

    }


    return password;

}



// ==================================================
// GENERATE BUTTON
// ==================================================

document
    .getElementById("generateButton")
    .addEventListener("click", () => {

        const generatedPassword =
            generatePassword();


        passwordField.value =
            generatedPassword;


        updatePasswordStrength(
            generatedPassword
        );

    });



// ==================================================
// PASSWORD STRENGTH
// ==================================================

function updatePasswordStrength(password) {

    if (password.length === 0) {

        strengthText.textContent =
            "—";

    }

    else if (password.length < 10) {

        strengthText.textContent =
            "Weak";

    }

    else if (password.length < 15) {

        strengthText.textContent =
            "Good";

    }

    else {

        strengthText.textContent =
            "Strong";

    }

}



// update strength when user manually types password
passwordField.addEventListener("input", () => {

    updatePasswordStrength(
        passwordField.value
    );

});



// ==================================================
// COPY PASSWORD
// ==================================================

const copyButton =
    document.getElementById("copyButton");


copyButton.addEventListener(
    "click",

    async () => {

        if (!passwordField.value) {
            return;
        }


        await navigator.clipboard.writeText(
            passwordField.value
        );


        copyButton.textContent =
            "Copied";


        setTimeout(() => {

            copyButton.textContent =
                "Copy";

        }, 1200);

    }
);



// ==================================================
// SAVE PASSWORD
// ==================================================

document
    .getElementById("savePasswordButton")
    .addEventListener("click", () => {

        const username =
            document
                .getElementById("usernameField")
                .value;


        const password =
            passwordField.value;


        if (!password) {

            alert(
                "Generate or enter a password first."
            );

            return;

        }


        /*
         * This is prototype storage only.
         *
         * stores plaintext credentials.
         *
         * We can replace this with encrypted storage
         * when the password manager is developed.
         */

        chrome.tabs.query(
            {
                active: true,
                currentWindow: true
            },

            (tabs) => {

                const website =
                    tabs[0]?.url ||
                    "Unknown Website";


                chrome.storage.local.set({

                    ["password_" + website]: {

                        username:
                            username,

                        password:
                            password

                    }

                });


                alert(
                    "Prototype password saved."
                );

            }
        );

    });



// ==================================================
// PLACEHOLDER MANAGEMENT BUTTONS
// ==================================================

document
    .getElementById("manageAdButton")
    .addEventListener("click", () => {

        alert(
            "Ad blocker management page will be added later."
        );

    });



document
    .getElementById("managePasswordsButton")
    .addEventListener("click", () => {

        alert(
            "Password management page will be added later."
        );

    });