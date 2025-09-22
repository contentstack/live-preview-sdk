import { clearVisibilityStyles, restoreVisibilityStyles } from "../clearStyles";

describe("clearStyles", () => {
    let element: HTMLDivElement;

    beforeEach(() => {
        element = document.createElement("div");
        document.body.appendChild(element);
    });

    afterEach(() => {
        document.body.removeChild(element);
    });

    describe("clearVisibilityStyles", () => {
        it("should hide element and disable transitions/animations", () => {
            // Set initial styles
            element.style.visibility = "visible";
            element.style.transition = "all 0.3s ease";
            element.style.animation = "fadeIn 1s";

            clearVisibilityStyles(element);

            expect(element.style.visibility).toBe("hidden");
            expect(element.style.transition).toBe("none");
            expect(element.style.animation).toBe("none");
        });

        it("should handle element with no initial styles", () => {
            clearVisibilityStyles(element);

            expect(element.style.visibility).toBe("hidden");
            expect(element.style.transition).toBe("none");
            expect(element.style.animation).toBe("none");
        });

        it("should store original style values", () => {
            // Set initial styles
            element.style.visibility = "visible";
            element.style.transition = "opacity 0.5s";
            element.style.animation = "slideIn 2s";

            clearVisibilityStyles(element);

            // Verify styles are cleared
            expect(element.style.visibility).toBe("hidden");
            expect(element.style.transition).toBe("none");
            expect(element.style.animation).toBe("none");

            // Verify we can restore (this indirectly tests that values were stored)
            restoreVisibilityStyles(element);
            expect(element.style.visibility).toBe("visible");
            expect(element.style.transition).toBe("opacity 0.5s");
            expect(element.style.animation).toBe("slideIn 2s");
        });

        it("should handle multiple calls on the same element", () => {
            element.style.visibility = "visible";
            element.style.transition = "all 0.3s";

            // First call
            clearVisibilityStyles(element);
            expect(element.style.visibility).toBe("hidden");

            // Second call should not overwrite stored values
            element.style.visibility = "hidden"; // Simulate current state
            clearVisibilityStyles(element);

            // Restore should still work with original values
            restoreVisibilityStyles(element);
            expect(element.style.visibility).toBe("visible");
            expect(element.style.transition).toBe("all 0.3s");
        });

        it("should handle empty string style values", () => {
            element.style.visibility = "";
            element.style.transition = "";
            element.style.animation = "";

            clearVisibilityStyles(element);
            restoreVisibilityStyles(element);

            expect(element.style.visibility).toBe("");
            expect(element.style.transition).toBe("");
            expect(element.style.animation).toBe("");
        });
    });

    describe("restoreVisibilityStyles", () => {
        it("should restore original styles after clearing", () => {
            const originalVisibility = "visible";
            const originalTransition = "all 0.3s ease-in-out";
            const originalAnimation = "bounce 1s infinite";

            element.style.visibility = originalVisibility;
            element.style.transition = originalTransition;
            element.style.animation = originalAnimation;

            clearVisibilityStyles(element);
            restoreVisibilityStyles(element);

            expect(element.style.visibility).toBe(originalVisibility);
            expect(element.style.transition).toBe(originalTransition);
            expect(element.style.animation).toBe(originalAnimation);
        });

        it("should handle restore without prior clear (no stored values)", () => {
            element.style.visibility = "visible";
            element.style.transition = "all 0.3s";

            // Call restore without clearing first
            restoreVisibilityStyles(element);

            // Should not modify styles when no stored values exist
            expect(element.style.visibility).toBe("visible");
            expect(element.style.transition).toBe("all 0.3s");
        });

        it("should remove stored values after restoration", () => {
            element.style.visibility = "visible";
            clearVisibilityStyles(element);
            restoreVisibilityStyles(element);

            // Second restore call should not affect styles
            element.style.visibility = "hidden";
            restoreVisibilityStyles(element);
            expect(element.style.visibility).toBe("hidden"); // Should remain unchanged
        });

        it("should restore empty string values correctly", () => {
            // Start with empty styles (which is the default)
            clearVisibilityStyles(element);
            restoreVisibilityStyles(element);

            expect(element.style.visibility).toBe("");
            expect(element.style.transition).toBe("");
            expect(element.style.animation).toBe("");
        });

        it("should handle partial style restoration", () => {
            element.style.visibility = "visible";
            element.style.transition = "opacity 0.5s";
            // animation is not set (empty)

            clearVisibilityStyles(element);
            restoreVisibilityStyles(element);

            expect(element.style.visibility).toBe("visible");
            expect(element.style.transition).toBe("opacity 0.5s");
            expect(element.style.animation).toBe("");
        });
    });

    describe("WeakMap storage behavior", () => {
        it("should handle multiple elements independently", () => {
            const element1 = document.createElement("div");
            const element2 = document.createElement("div");
            document.body.appendChild(element1);
            document.body.appendChild(element2);

            element1.style.visibility = "visible";
            element1.style.transition = "all 0.3s";
            element2.style.visibility = "hidden";
            element2.style.animation = "fadeIn 1s";

            clearVisibilityStyles(element1);
            clearVisibilityStyles(element2);

            restoreVisibilityStyles(element1);
            restoreVisibilityStyles(element2);

            expect(element1.style.visibility).toBe("visible");
            expect(element1.style.transition).toBe("all 0.3s");
            expect(element1.style.animation).toBe(""); // Was not set originally

            expect(element2.style.visibility).toBe("hidden");
            expect(element2.style.transition).toBe(""); // Was not set originally
            expect(element2.style.animation).toBe("fadeIn 1s");

            document.body.removeChild(element1);
            document.body.removeChild(element2);
        });

        it("should not leak memory after element removal", () => {
            const tempElement = document.createElement("div");
            tempElement.style.visibility = "visible";

            clearVisibilityStyles(tempElement);

            // Element is not in DOM and has no references
            // WeakMap should allow garbage collection
            // This test mainly documents the expected behavior
            expect(tempElement.style.visibility).toBe("hidden");
        });
    });

    describe("CSS property handling edge cases", () => {
        it("should handle complex transition values", () => {
            element.style.transition =
                "opacity 0.3s ease-in-out, transform 0.5s linear";

            clearVisibilityStyles(element);
            expect(element.style.transition).toBe("none");

            restoreVisibilityStyles(element);
            expect(element.style.transition).toBe(
                "opacity 0.3s ease-in-out, transform 0.5s linear"
            );
        });

        it("should handle complex animation values", () => {
            element.style.animation =
                "slideIn 0.5s ease-out, fadeIn 1s linear infinite";

            clearVisibilityStyles(element);
            expect(element.style.animation).toBe("none");

            restoreVisibilityStyles(element);
            expect(element.style.animation).toBe(
                "slideIn 0.5s ease-out, fadeIn 1s linear infinite"
            );
        });

        it("should handle inherit and initial values", () => {
            element.style.visibility = "inherit";
            element.style.transition = "initial";
            element.style.animation = "inherit";

            clearVisibilityStyles(element);
            restoreVisibilityStyles(element);

            expect(element.style.visibility).toBe("inherit");
            expect(element.style.transition).toBe("initial");
            expect(element.style.animation).toBe("inherit");
        });
    });
});
