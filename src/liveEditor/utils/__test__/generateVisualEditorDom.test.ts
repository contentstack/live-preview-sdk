import {
    generateVisualEditorCursor,
    generateVisualEditorOverlay,
    generateVisualEditorWrapper,
} from "../generateVisualEditorDom";

describe("generateVisualEditorOverlay", () => {
    const onOverlayClick = jest.fn();

    afterEach(() => {
        onOverlayClick.mockClear();
    });

    test("should generate overlay", () => {
        const overlay = generateVisualEditorOverlay(onOverlayClick);
        expect(overlay).toMatchSnapshot();
    });

    test("should run the function when clicked on the overlay", () => {
        const overlayWrapper = generateVisualEditorOverlay(onOverlayClick);
        const overlay = overlayWrapper.children[0] as HTMLDivElement;

        overlay.click();
        expect(onOverlayClick).toHaveBeenCalledTimes(1);
    });
});

describe("generateVisualEditorCursor", () => {
    test("should generate cursor", () => {
        const cursor = generateVisualEditorCursor();
        expect(cursor).toMatchSnapshot();
    });
});

describe("generateVisualEditorWrapper", () => {
    test("should generate wrapper", () => {
        const overlay = generateVisualEditorOverlay(jest.fn());
        const cursor = generateVisualEditorCursor();

        const wrapper = generateVisualEditorWrapper({
            cursor,
            overlay,
        });
        expect(wrapper).toMatchSnapshot();
    });
});
