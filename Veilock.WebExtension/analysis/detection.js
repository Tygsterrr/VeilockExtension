
/*
 * VEILOCK CREDENTIAL THREAT DETECTION
 * Version 0.1
 *
 * Rule-based website analysis.
 * No paid APIs or external databases.
 *
 * Risk scores are experimental indicators,
 * not guarantees of website safety.
 */

const VeilockDetector = (() => {

    function analyze(urlString, pageData = null) {

        let url;

        try {
            url = new URL(urlString);
        } catch {
            return {
                supported: false,
                message: "Invalid website URL."
            };
        }

        if (!["http:", "https:"].includes(url.protocol)) {
            return {
                supported: false,
                message: "This browser page cannot be analyzed."
            };
        }

        const findings = [];

        function addFinding(id, points, message) {
            findings.push({ id, points, message });
        }

        const hostname = url.hostname.toLowerCase();

        const path = (
            url.pathname + url.search
        ).toLowerCase();

        // ==================================================
        // CHECK 1 - HTTP CONNECTION
        // ==================================================

        if (url.protocol === "http:") {
            addFinding(
                "http",
                15,
                "This website uses HTTP instead of HTTPS."
            );
        }

        // ==================================================
        // CHECK 2 - IP ADDRESS HOSTNAME
        // ==================================================

        const ipv4Parts = hostname.split(".");

        const isIPv4 =
            ipv4Parts.length === 4 &&
            ipv4Parts.every(part =>
                /^\d{1,3}$/.test(part) &&
                Number(part) <= 255
            );

        const isIPv6 =
            hostname.startsWith("[") &&
            hostname.endsWith("]");

        if (isIPv4 || isIPv6) {
            addFinding(
                "ip-host",
                10,
                "The website uses an IP address instead of a domain."
            );
        }

        // ==================================================
        // CHECK 3 - INTERNATIONALIZED DOMAIN
        // ==================================================

        if (
            hostname.split(".").some(label =>
                label.startsWith("xn--")
            )
        ) {
            addFinding(
                "idn",
                5,
                "The domain uses an internationalized label. Verify its spelling."
            );
        }

        // ==================================================
        // CHECK 4 - CREDENTIAL-RELATED URL PATTERNS
        // ==================================================

        const credentialPattern =
            /(verify[-_]?account|confirm[-_]?password|update[-_]?credentials|secure[-_]?login)/i;

        if (credentialPattern.test(path)) {
            addFinding(
                "credential-url",
                10,
                "The URL contains credential-related wording."
            );
        }

        // ==================================================
        // CHECK 5 - UNUSUALLY LONG URL
        // ==================================================

        if (urlString.length > 200) {
            addFinding(
                "long-url",
                5,
                "The website URL is unusually long."
            );
        }

        // ==================================================
        // CHECK 6 - PASSWORD FORM ANALYSIS
        // ==================================================

        const inspected = Boolean(
            pageData &&
            pageData.url === urlString &&
            Number.isInteger(pageData.passwordFields) &&
            Number.isInteger(pageData.insecurePasswordForms) &&
            Number.isInteger(pageData.crossOriginPasswordForms)
        );

        if (inspected) {

            if (pageData.insecurePasswordForms > 0) {
                addFinding(
                    "insecure-form",
                    35,
                    "A password form submits to an HTTP destination."
                );
            }

            if (pageData.crossOriginPasswordForms > 0) {
                addFinding(
                    "cross-origin-form",
                    15,
                    "A password form submits to a different origin."
                );
            }

            if (
                pageData.passwordFields > 0 &&
                url.protocol === "http:"
            ) {
                addFinding(
                    "http-password",
                    25,
                    "Password fields were found on an HTTP page."
                );
            }
        }

        // ==================================================
        // CALCULATE RISK SCORE
        // ==================================================

        const risk = Math.min(
            100,
            findings.reduce(
                (total, finding) => total + finding.points,
                0
            )
        );

        let level = "LOW";

        if (risk >= 50) {
            level = "HIGH";
        } else if (risk >= 20) {
            level = "ELEVATED";
        }

        return {
            supported: true,
            risk,
            level,
            findings,
            inspected,
            passwordFields:
                inspected ? pageData.passwordFields : null,
            formDestinations:
                inspected ? pageData.formDestinations : [],
            threatDatabase: "Not checked"
        };
    }

    return { analyze };

})();
