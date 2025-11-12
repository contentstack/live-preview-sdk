import { stripMetadata, hasEncodedMetadata } from "./encodeDecode";

/**
 * MutationObserver that monitors img elements and ensures their src attributes
 * are clean (without invisible metadata). This prevents image loading issues
 * when URLs contain encoded metadata.
 */
class ImageSrcCleaner {
    private observer: MutationObserver | null = null;

    /**
     * Cleans the src attribute of an image element if it contains encoded metadata
     */
    private cleanImageSrc(img: HTMLImageElement): void {
        const src = img.getAttribute("src");
        
        if (!src) {
            return;
        }

        // Check if the src contains encoded metadata
        if (hasEncodedMetadata(src)) {
            const cleanSrc = stripMetadata(src);
            
            // Only update if the clean value is different
            if (cleanSrc !== src) {
                img.setAttribute("src", cleanSrc);
            }
        }
    }

    /**
     * Processes all existing images on the page
     */
    private cleanAllExistingImages(): void {
        const images = document.querySelectorAll("img");
        images.forEach((img) => {
            if (img instanceof HTMLImageElement) {
                this.cleanImageSrc(img);
            }
        });
    }

    /**
     * Starts observing the document for image elements
     */
    start(): void {
        if (this.observer) {
            return; // Already observing
        }

        // Clean all existing images first
        this.cleanAllExistingImages();

        // Create the mutation observer
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                // Handle added nodes
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the node itself is an img
                        if (node instanceof HTMLImageElement) {
                            this.cleanImageSrc(node);
                        }
                        
                        // Check for img elements within the added node
                        if (node instanceof Element) {
                            const images = node.querySelectorAll("img");
                            images.forEach((img) => {
                                if (img instanceof HTMLImageElement) {
                                    this.cleanImageSrc(img);
                                }
                            });
                        }
                    });
                }
                
                // Handle attribute changes on img elements
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "src" &&
                    mutation.target instanceof HTMLImageElement
                ) {
                    this.cleanImageSrc(mutation.target);
                }
            }
        });

        // Start observing the document with the configured parameters
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["src"],
        });
    }

    /**
     * Stops observing and disconnects the observer
     */
    stop(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    /**
     * Cleans all images and restarts observation
     */
    refresh(): void {
        this.cleanAllExistingImages();
    }
}

// Export a singleton instance
export const imageSrcCleaner = new ImageSrcCleaner();

