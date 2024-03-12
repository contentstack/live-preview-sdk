import "@testing-library/jest-dom/extend-expect";
import { inIframe } from "../../../common/inIframe";
import Config from "../../../configManager/configManager";
import { shouldRenderEditButton } from "../editButton";

jest.mock("../../../common/inIframe", () => ({
    __esModule: true,
    ...jest.requireActual("../../../common/inIframe"),
    inIframe: jest.fn(),
}));

describe("shouldRenderEditButton", () => {
    beforeEach(() => {
        Config.reset();
    });

    afterAll(() => {
        Config.reset();
    });

    test("should not render if enable is true no matter what", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: false,
                exclude: ["insideLivePreviewPortal"],
                includeByQueryParameter: false,
            },
        });

        expect(shouldRenderEditButton()).toBe(false);

        Config.replace({
            enable: true,
            editButton: {
                enable: false,
                exclude: ["outsideLivePreviewPortal"],
                includeByQueryParameter: false,
            },
        });

        expect(shouldRenderEditButton()).toBe(false);

        Config.replace({
            enable: true,
            editButton: {
                enable: false,
                exclude: [
                    "insideLivePreviewPortal",
                    "outsideLivePreviewPortal",
                ],
                includeByQueryParameter: false,
            },
        });

        expect(shouldRenderEditButton()).toBe(false);

        Config.replace({
            enable: true,
            editButton: {
                enable: false,
                exclude: [
                    "insideLivePreviewPortal",
                    "outsideLivePreviewPortal",
                ],
                includeByQueryParameter: true,
            },
        });

        expect(shouldRenderEditButton()).toBe(false);
    });

    test("should not render if live preview ", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: true,
                exclude: ["insideLivePreviewPortal"],
                includeByQueryParameter: false,
            },
        });

        (inIframe as jest.Mock).mockReturnValueOnce(true);

        expect(shouldRenderEditButton()).toBe(false);
    });

    test("should not render if outside live preview ", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: true,
                exclude: ["outsideLivePreviewPortal"],
                includeByQueryParameter: false,
            },
        });

        (inIframe as jest.Mock).mockReturnValueOnce(true);

        expect(shouldRenderEditButton()).toBe(false);
    });

    test("should not render if inside live editor ", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: true,
            },
        });

        Config.set("windowType", "editor");

        (inIframe as jest.Mock).mockReturnValueOnce(true);
        expect(shouldRenderEditButton()).toBe(false);
    });

    test("should render if independent site", () => {
        Config.replace({
            enable: true,
            editButton: {
                enable: true,
            },
        });

        Config.set("windowType", "independent");

        (inIframe as jest.Mock).mockReturnValueOnce(true);
        expect(shouldRenderEditButton()).toBe(true);
    });
});
