import { Mock, vitest } from "vitest";
import { DOMRect } from "../../../__test__/utils";
import {
    createMultipleEditButton,
    createSingularEditButton,
    getEditButtonPosition,
    isPointerWithinEditButtonSafeZone,
    shouldRenderEditButton,
} from "../editButton";
import Config from "../../../configManager/configManager";
import * as inIframe from "../../../common/inIframe";
import { PublicLogger } from "../../../logger/logger";

let editCallback: Mock<(e: MouseEvent) => void> | undefined;
let linkCallback: Mock<(e: MouseEvent) => void> | undefined;
let editButtonForHyperlink: HTMLDivElement | undefined;
let editButtonForNonHyperlink: HTMLDivElement | undefined;
let tooltipChild: HTMLCollectionOf<HTMLDivElement> | undefined;

describe("Edit button", () => {
    beforeAll(() => {
        document.body.innerHTML = "";
    });
    beforeEach(() => {
        editCallback = vi.fn();

        editButtonForNonHyperlink = createSingularEditButton(editCallback);

        document.body.appendChild(editButtonForNonHyperlink);

        tooltipChild = document.getElementsByClassName(
            "cslp-tooltip-child"
        ) as HTMLCollectionOf<HTMLDivElement>;
    });

    afterEach(() => {
        editCallback = undefined;
        linkCallback = undefined;
        editButtonForNonHyperlink = undefined;
        tooltipChild = undefined;

        document.body.innerHTML = "";
    });

    test("runs edit callback when clicked", () => {
        if (!(editCallback && editButtonForNonHyperlink && tooltipChild))
            assert.fail("missing dependencies");

        const editButton = tooltipChild[0];
        editButton.click();
        expect(editCallback).toBeCalled();
    });
});

describe("getEditButtonPosition: Edit button", () => {
    beforeAll(() => {
        const titlePara = document.createElement("h3");
        titlePara.setAttribute("data-test-id", "title-para");
        if (titlePara) {
            titlePara.getBoundingClientRect = vi.fn(
                () => new DOMRect(53, 75, 1529, 10)
            );
        }

        document.body.appendChild(titlePara);
    });

    afterAll(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        vi.clearAllMocks();
    });

    test("should be positioned on top of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "top")
        ).toStrictEqual({ upperBoundOfTooltip: 36.75, leftBoundOfTooltip: 53 });
    });

    test("should be positioned on top-left of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "top-left")
        ).toStrictEqual({ upperBoundOfTooltip: 36.75, leftBoundOfTooltip: 53 });
    });

    test("should be positioned on top-center of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "top-center")
        ).toStrictEqual({
            upperBoundOfTooltip: 36.75,
            leftBoundOfTooltip: 786.5,
        });
    });

    test("should be positioned on top-right of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "top-right")
        ).toStrictEqual({
            upperBoundOfTooltip: 36.75,
            leftBoundOfTooltip: 1515,
        });
    });

    test("should be positioned on right of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "right")
        ).toStrictEqual({
            upperBoundOfTooltip: 71.75,
            leftBoundOfTooltip: 1592,
        });
    });

    test("should be positioned on bottom-right of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "bottom-right")
        ).toStrictEqual({
            upperBoundOfTooltip: 114.75,
            leftBoundOfTooltip: 1515,
        });
    });

    test("should be positioned on bottom-center of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "bottom-center")
        ).toStrictEqual({
            upperBoundOfTooltip: 114.75,
            leftBoundOfTooltip: 786.5,
        });
    });

    test("should be positioned on bottom-left of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "bottom-left")
        ).toStrictEqual({
            upperBoundOfTooltip: 114.75,
            leftBoundOfTooltip: 53,
        });
    });

    test("should be positioned on bottom of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "bottom")
        ).toStrictEqual({
            upperBoundOfTooltip: 114.75,
            leftBoundOfTooltip: 53,
        });
    });

    test("should be positioned on left of hovered element", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "left")
        ).toStrictEqual({
            upperBoundOfTooltip: 71.75,
            leftBoundOfTooltip: -19,
        });
    });

    test("should override the default position if position attribute is present", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        titlePara?.setAttribute("data-cslp-button-position", "top-center");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "top-left")
        ).toStrictEqual({
            upperBoundOfTooltip: 36.75,
            leftBoundOfTooltip: 786.5,
        });
    });

    test("should positioned on top-left if the passed position is not valid ", async () => {
        const titlePara = document.querySelector("[data-test-id='title-para']");
        titlePara?.setAttribute("data-cslp-button-position", "random-string");
        expect(
            getEditButtonPosition(titlePara as HTMLElement, "top-left")
        ).toStrictEqual({ upperBoundOfTooltip: 36.75, leftBoundOfTooltip: 53 });
    });
});

describe("Edit button for Link", () => {
    beforeEach(() => {
        editCallback = vi.fn();
        linkCallback = vi.fn();

        editButtonForHyperlink = createMultipleEditButton(
            editCallback,
            linkCallback
        );

        document.body.appendChild(editButtonForHyperlink);

        tooltipChild = document.getElementsByClassName(
            "cslp-tooltip-child"
        ) as HTMLCollectionOf<HTMLDivElement>;
    });

    afterEach(() => {
        editCallback = undefined;
        linkCallback = undefined;
        editButtonForHyperlink = undefined;
        tooltipChild = undefined;

        document.body.innerHTML = "";
    });

    test("edit button must have 2 separate button", () => {
        expect(tooltipChild).toHaveLength(2);
    });

    test("runs edit callback on button click", () => {
        if (
            !(
                editCallback &&
                linkCallback &&
                editButtonForHyperlink &&
                tooltipChild
            )
        )
            assert.fail("missing dependencies");

        const editButton = tooltipChild[0];
        editButton.click();
        expect(editCallback).toBeCalled();
    });

    test("runs link callback on button click", () => {
        if (
            !(
                editCallback &&
                linkCallback &&
                editButtonForHyperlink &&
                tooltipChild
            )
        )
            assert.fail("missing dependencies");

        const linkButton = tooltipChild[1];
        linkButton.click();
        expect(linkCallback).toBeCalled();
    });
});

describe("shouldRenderEditButton", () => {
    test("should return true if the config has enabled as true", () => {
        vitest
            .spyOn(Config, "get")
            .mockReturnValue({ editButton: { enable: true } });
        expect(shouldRenderEditButton()).toBe(true);
    });
    test("should return false if the config has enabled as false", () => {
        vitest
            .spyOn(Config, "get")
            .mockReturnValue({ editButton: { enable: false } });
        expect(shouldRenderEditButton()).toBe(false);
    });

    describe("includeByQueryParameter", () => {
        test("should log error and return false if enable key is undefined", () => {
            const loggerSpy = vitest.spyOn(PublicLogger, "error");
            vitest.spyOn(Config, "get").mockReturnValue({ editButton: {} });
            expect(shouldRenderEditButton()).toBe(false);
            expect(loggerSpy).toHaveBeenCalledWith(
                "enable key is required inside editButton object"
            );
        });

        test("should return true if cslp-buttons query parameter is true", () => {
            vitest
                .spyOn(Config, "get")
                .mockReturnValue({ editButton: { enable: true } });
            vitest.spyOn(window, "location", "get").mockReturnValue({
                href: "http://example.com?cslp-buttons=true",
            } as Location);
            expect(shouldRenderEditButton()).toBe(true);
        });

        test("should return false if cslp-buttons query parameter is false", () => {
            vitest
                .spyOn(Config, "get")
                .mockReturnValue({ editButton: { enable: true } });
            vitest.spyOn(window, "location", "get").mockReturnValue({
                href: "http://example.com?cslp-buttons=false",
            } as Location);
            expect(shouldRenderEditButton()).toBe(false);
        });

        test("should return true if cslp-buttons query parameter is not present", () => {
            vitest
                .spyOn(Config, "get")
                .mockReturnValue({ editButton: { enable: true } });
            vitest.spyOn(window, "location", "get").mockReturnValue({
                href: "http://example.com",
            } as Location);
            expect(shouldRenderEditButton()).toBe(true);
        });
    });
    describe("exclude", () => {
        test("should return false if the config has exclude as `insideLivePreviewPortal` and the element is inside live preview portal", () => {
            vitest.spyOn(inIframe, "inIframe").mockReturnValue(true);
            vitest.spyOn(Config, "get").mockReturnValue({
                editButton: {
                    enable: true,
                    exclude: ["insideLivePreviewPortal"],
                },
            });
            expect(shouldRenderEditButton()).toBe(false);
        });
        test("should return true if the config has exclude as `insideLivePreviewPortal` and the element is not inside live preview portal", () => {
            vitest.spyOn(inIframe, "inIframe").mockReturnValue(false);
            vitest.spyOn(Config, "get").mockReturnValue({
                editButton: {
                    enable: true,
                    exclude: ["insideLivePreviewPortal"],
                },
            });
            expect(shouldRenderEditButton()).toBe(true);
        });
        test("should return false if the config has exclude as `outsideLivePreviewPortal` and the element is not inside live preview portal", () => {
            vitest.spyOn(inIframe, "inIframe").mockReturnValue(false);
            vitest.spyOn(Config, "get").mockReturnValue({
                editButton: {
                    enable: true,
                    exclude: ["outsideLivePreviewPortal"],
                },
            });
            expect(shouldRenderEditButton()).toBe(false);
        });
        test("should return true if the config has exclude as `outsideLivePreviewPortal` and the element is inside live preview portal", () => {
            vitest.spyOn(inIframe, "inIframe").mockReturnValue(true);
            vitest.spyOn(Config, "get").mockReturnValue({
                editButton: {
                    enable: true,
                    exclude: ["outsideLivePreviewPortal"],
                },
            });
            expect(shouldRenderEditButton()).toBe(true);
        });
    });

    test("should return false if the website is rendered in Builder", () => {
        vitest.spyOn(Config, "get").mockReturnValue({
            editButton: { enable: true },
            windowType: "builder",
        });
        vitest.spyOn(inIframe, "inIframe").mockReturnValue(true);
        expect(shouldRenderEditButton()).toBe(false);
    });
});

describe.only("isPointerWithinEditButtonSafeZone", () => {
    let mockEvent: MouseEvent;
    let mockElement: HTMLElement;

    beforeEach(() => {
        // Set up mock element that will be found in the composed path
        mockElement = document.createElement("div");
        mockElement.setAttribute("data-cslp", "");

        // Mock getBoundingClientRect for the element
        mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
            x: 100,
            y: 100,
            width: 200,
            height: 150,
            top: 100,
            right: 300,
            bottom: 250,
            left: 100,
        });

        // Set up mock event
        mockEvent = {
            clientX: 150,
            clientY: 120,
            composedPath: vi.fn().mockReturnValue([mockElement, document.body]),
        } as unknown as MouseEvent;
    });

    test("should return undefined when editButtonDomRect is not provided", () => {
        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect: undefined,
            editButtonPos: "top",
        });
        expect(result).toBeUndefined();
    });

    test("should return undefined when editButtonPos is not provided", () => {
        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect: new DOMRect(150, 80, 50, 20),
            editButtonPos: undefined,
        });
        expect(result).toBeUndefined();
    });

    test("should return undefined when editButtonDomRect has non-positive coordinates", () => {
        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect: new DOMRect(-1, 80, 50, 20),
            editButtonPos: "top",
        });
        expect(result).toBeUndefined();
    });

    test("should return undefined when no element with data-cslp attribute is found", () => {
        mockEvent.composedPath = vi.fn().mockReturnValue([document.body]);
        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect: new DOMRect(150, 80, 50, 20),
            editButtonPos: "top",
        });
        expect(result).toBeUndefined();
    });

    test("should return false when pointer is within safe zone (top position)", () => {
        // Button at the top with pointer near it
        const editButtonDomRect = new DOMRect(150, 80, 50, 20);
        // @ts-expect-error mocking event properties
        mockEvent.clientX = 160;
        // @ts-expect-error mocking event properties
        mockEvent.clientY = 105;

        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect,
            editButtonPos: "top",
        });
        expect(result).toBe(false);
    });

    test("should return false when pointer is within safe zone (bottom position)", () => {
        // Button at the bottom with pointer near it
        const editButtonDomRect = new DOMRect(150, 260, 50, 20);
        // @ts-expect-error mocking event properties
        mockEvent.clientX = 160;
        // @ts-expect-error mocking event properties
        mockEvent.clientY = 255;

        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect,
            editButtonPos: "bottom",
        });
        expect(result).toBe(false);
    });

    test("should return false when pointer is within safe zone (left position)", () => {
        // Button at the left with pointer near it
        const editButtonDomRect = new DOMRect(80, 150, 20, 50);
        // @ts-expect-error mocking event properties
        mockEvent.clientX = 105;
        // @ts-expect-error mocking event properties
        mockEvent.clientY = 160;

        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect,
            editButtonPos: "left",
        });
        expect(result).toBe(false);
    });

    test("should return false when pointer is within safe zone (right position)", () => {
        // Button at the right with pointer near it
        const editButtonDomRect = new DOMRect(310, 150, 20, 50);
        // @ts-expect-error mocking event properties
        mockEvent.clientX = 305;
        // @ts-expect-error mocking event properties
        mockEvent.clientY = 160;

        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect,
            editButtonPos: "right",
        });
        expect(result).toBe(false);
    });

    test("should return true when pointer is outside safe zone", () => {
        // Button at the top with pointer far away from it
        const editButtonDomRect = new DOMRect(150, 80, 50, 20);
        // @ts-expect-error mocking event properties
        mockEvent.clientX = 160;
        // @ts-expect-error mocking event properties
        mockEvent.clientY = 200;

        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect,
            editButtonPos: "top",
        });
        expect(result).toBe(true);
    });

    test("should cap safe zone distance at MAX_SAFE_ZONE_DISTANCE", () => {
        // Create a very large element that would exceed MAX_SAFE_ZONE_DISTANCE
        mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
            x: 100,
            y: 100,
            width: 1000, // Large width
            height: 1000, // Large height
            top: 100,
            right: 1100,
            bottom: 1100,
            left: 100,
        });

        const editButtonDomRect = new DOMRect(150, 80, 50, 20);
        // @ts-expect-error mocking event properties
        mockEvent.clientX = 160;
        // @ts-expect-error mocking event properties
        mockEvent.clientY = 115; // 35px from the bottom of the button which is > 30px

        const result = isPointerWithinEditButtonSafeZone({
            event: mockEvent,
            editButtonDomRect,
            editButtonPos: "top",
        });

        // Should still return false as we're within the max safe zone distance
        expect(result).toBe(false);
    });
});
