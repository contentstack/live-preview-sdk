export const handlePageTraversal = () => {
    window.addEventListener("unload", () => {
        const targetURL = (document.activeElement as HTMLAnchorElement).href;
        if (targetURL) {
            window.parent.postMessage(
                {
                    from: "live-preview",
                    type: "url-change",
                    data: {
                        targetURL,
                    },
                },
                "*"
            );
        }
    });
};
