import {
    createMultipleEditButton,
    createSingularEditButton,
    hasWindow,
} from "../index";

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
