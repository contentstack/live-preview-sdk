import { DOMRect } from "../../__test__/utils";
import {
    createMultipleEditButton,
    createSingularEditButton,
    getEditButtonPosition,
    hasWindow,
} from "../index";
import { IConfigEditButton } from "../types";

let editCallback: jest.Mock<void, [e: MouseEvent]> | undefined;
let linkCallback: jest.Mock<void, [e: MouseEvent]> | undefined;
let editButtonForHyperlink: HTMLDivElement | undefined;
let editButtonForNonHyperlink: HTMLDivElement | undefined;
let tooltipChild: HTMLCollectionOf<HTMLDivElement> | undefined;

describe("Edit button for Link", () => {
    beforeEach(() => {
        editCallback = jest.fn();
        linkCallback = jest.fn();

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
            fail("missing dependencies");

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
            fail("missing dependencies");

        const linkButton = tooltipChild[1];
        linkButton.click();
        expect(linkCallback).toBeCalled();
    });
});

describe("hasWindow() function", () => {
    test("must check if window is available", () => {
        expect(hasWindow()).toBe(typeof window !== "undefined");
    });
});

describe("Edit button", () => {
    beforeEach(() => {
        editCallback = jest.fn();

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
            fail("missing dependencies");

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
            titlePara.getBoundingClientRect = jest.fn(
                () => new DOMRect(53, 75, 1529, 10)
            );
        }

        document.body.appendChild(titlePara);
    });

    afterAll(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        jest.clearAllMocks();
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
