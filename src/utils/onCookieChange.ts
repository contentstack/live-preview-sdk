/**
 * An event listener for cookie changes.
 * @param {Function} callback A callback function to be called when the cookie changes
 * @param {number} interval number of milliseconds to wait between each check
 */

export function onCookieChange(
    callback: (event: {
        previousCookies: string;
        currentCookies: string;
    }) => void,
    interval = 1000
) {
    let lastCookie = document.cookie;
    setInterval(() => {
        let cookie = document.cookie;
        if (cookie !== lastCookie) {
            try {
                callback({
                    previousCookies: lastCookie,
                    currentCookies: cookie,
                });
            } finally {
                lastCookie = cookie;
            }
        }
    }, interval);
}
