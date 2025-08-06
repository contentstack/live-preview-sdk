import { getCommunicationTarget } from "../common";

export const handlePageTraversal = () => {
    window.addEventListener("unload", () => {
        const targetURL = (document.activeElement as HTMLAnchorElement).href;
        const target = getCommunicationTarget();
        
        if (targetURL && target) {
            target.postMessage(
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
