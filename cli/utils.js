import yoctoSpinner from "yocto-spinner";

/**
 * Creates a spinner that only shows if stdout is a TTY
 * @param {...any} args
 * @returns {import("yocto-spinner").Spinner}
 */
export function ttyOnlySpinner(...args) {
    // Only show a spinner if stdout is a TTY
    if (process.stdout.isTTY) {
        return yoctoSpinner(...args);
    }

    // If not a TTY, return a dummy spinner with empty chainable methods
    return {
        start() {
            return this;
        },
        success() {
            return this;
        },
        error() {
            return this;
        },
    };
}

/**
 * Converts a list of pause plans to a JSON string
 * @param {import("./fetchPausePlans").PausePlan[]} plans
 * @param {number} [spaces=0] Number of spaces for JSON.stringify
 * @returns {string}
 */
export function createJson(plans, spaces = 0) {
    return JSON.stringify(
        plans,
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        spaces,
    );
}

/**
 * Converts a Unix timestamp to human readable date
 * @param {bigint} timestamp Unix timestamp
 * @returns {string}
 */
export function formatDate(timestamp) {
    const date = new Date(Number(timestamp) * 1000);

    const datePart = date.toISOString().slice(0, 10);

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        hour12: false,
    };

    const timePart = new Intl.DateTimeFormat("en-US", timeOptions).format(date);

    return `${datePart} ${timePart} UTC`;
}
