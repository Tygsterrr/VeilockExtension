/*
 * VEILOCK CONTENT SCRIPT
 *
 * Preserves existing PAGE_INFO communication.
 * Adds credential-form inspection without
 * collecting usernames or passwords.
 */

// shows loading confirmation and current website information -SG
console.log("Veilock content script loaded.");
console.log("Current website:", window.location.href);

// communicates information about current webpage to other extension parts -TS
chrome.runtime.sendMessage({
    type: "PAGE_INFO",
    url: window.location.href,
    title: document.title
});

// ==================================================
// CREDENTIAL FORM INSPECTION
// ==================================================

function inspectCredentialForms() {

    // Only identify password inputs.
    // Never access their .value property.
    const passwordInputs = [
        ...document.querySelectorAll('input[type="password"]')
    ];

    const passwordForms = new Set();

    passwordInputs.forEach(input => {
        if (input.form) {
            passwordForms.add(input.form);
        }
    });

    let insecurePasswordForms = 0;
    let crossOriginPasswordForms = 0;

    const formDestinations = [];

    passwordForms.forEach(form => {
        try {
            const action = form.getAttribute("action");

            const destination = new URL(
                action || window.location.href,
                window.location.href
            );

            if (destination.protocol === "http:") {
                insecurePasswordForms++;
            }

            if (destination.origin !== window.location.origin) {
                crossOriginPasswordForms++;
            }

            // Store origins only, not full URLs.
            formDestinations.push(destination.origin);

        } catch (error) {
            console.warn(
                "Veilock form inspection error:",
                error
            );
        }
    });

    return {
        url: window.location.href,
        passwordFields: passwordInputs.length,
        passwordForms: passwordForms.size,
        insecurePasswordForms,
        crossOriginPasswordForms,
        formDestinations: [
            ...new Set(formDestinations)
        ].slice(0, 20)
    };
}

// ==================================================
// MESSAGE LISTENER
// ==================================================

// Adds VEILOCK_SCAN without interfering with PAGE_INFO.

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message?.type === "VEILOCK_SCAN") {
            sendResponse(inspectCredentialForms());
        }

    }
);
