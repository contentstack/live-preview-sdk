import "@testing-library/jest-dom/extend-expect";
import {
    doesEditButtonExist,
    shouldRenderEditButton,
    toggleEditButtonElement,
} from "../editButton";
import Config from "../../../configManager/configManager";

jest.mock("../editButton", () => ({
    __esModule: true,
    ...jest.requireActual("../editButton"),
    doesEditButtonExist: jest.fn(),
    shouldRenderEditButton: jest.fn(),
}));

describe("toggleEditButtonElement", () => {
    beforeEach(() => {
        Config.reset();
        jest.clearAllMocks();
    });

    afterAll(() => {
        Config.reset();
    });

    test("should render if edit button does not exists but needs to render", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: true,
            },
        });

        Config.set("windowType", "independent");

        const check = document.getElementById("cslp-tooltip");
        if (check) {
            check.remove();
        }

        toggleEditButtonElement();

        expect(document.getElementById("cslp-tooltip")).toBeInTheDocument();
    });

    test("should remove the edit button if it should not exist but is rendered.", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: false,
                exclude: ["insideLivePreviewPortal"],
                includeByQueryParameter: false,
            },
        });

        const check = document.getElementById("cslp-tooltip");
        if (check) {
            check.remove();
        }

        toggleEditButtonElement();

        expect(document.getElementById("cslp-tooltip")).not.toBeInTheDocument();
    });

    test("should not do anything if it is not rendered and it is not required", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: false,
                exclude: ["insideLivePreviewPortal"],
                includeByQueryParameter: false,
            },
        });

        const check = document.getElementById("cslp-tooltip");
        if (check) {
            check.remove();
        }

        toggleEditButtonElement();

        expect(document.getElementById("cslp-tooltip")).not.toBeInTheDocument();
    });

    test("should not do anything if it is rendered and it is required", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: true,
            },
        });

        Config.set("windowType", "independent");

        // doesExist = true
        const check = document.getElementById("cslp-tooltip");
        if (!check) {
            const editButton = document.createElement("button");
            editButton.id = "cslp-tooltip";
            document.body.appendChild(editButton);
        }

        toggleEditButtonElement();

        expect(document.getElementById("cslp-tooltip")).toBeInTheDocument();
    });
});
