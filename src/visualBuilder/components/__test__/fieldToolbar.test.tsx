import {
    act,
    cleanup,
    fireEvent,
    render,
    waitFor,
    screen,
} from "@testing-library/preact";
import { CslpData } from "../../../cslp/types/cslp.types";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../../utils/instanceHandlers";
import { ISchemaFieldMap } from "../../utils/types/index.types";
import FieldToolbarComponent from "../FieldToolbar";
import {
    mockMultipleLinkFieldSchema,
    mockMultipleFileFieldSchema,
} from "../../../__test__/data/fields";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { isFieldDisabled } from "../../utils/isFieldDisabled";
import React from "preact/compat";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { FieldLocationIcon } from "../FieldLocationIcon";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";

vi.mock("../../utils/instanceHandlers", () => ({
    handleMoveInstance: vi.fn(),
    handleDeleteInstance: vi.fn(),
}));

//CommentIcon testcases are covered seperatly
vi.mock("../CommentIcon", () => ({
    default: vi.fn(() => <div>Comment Icon</div>),
}));

vi.mock("../../utils/visualBuilderPostMessage", () => {
    return {
        default: {
            send: vi.fn((eventName: string) => {
                // Return mock data for FIELD_LOCATION_DATA to prevent hanging
                if (eventName === "field-location-data") {
                    return Promise.resolve({ apps: [] });
                }
                // Return mock data for get-field-variant-status to speed up variant icon test
                if (eventName === "get-field-variant-status") {
                    return Promise.resolve({
                        isAddedInstances: false,
                        isBaseModified: false,
                        isDeletedInstances: false,
                        isOrderChanged: false,
                        fieldLevelCustomizations: false,
                    });
                }
                return Promise.resolve({});
            }),
            on: vi.fn(() => ({ unregister: vi.fn() })),
        },
    };
});

vi.mock("../FieldRevert/FieldRevertComponent", async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import("../FieldRevert/FieldRevertComponent")
        >();

    return {
        ...actual,
        getFieldVariantStatus: vi.fn().mockResolvedValue({
            isAddedInstances: false,
            isBaseModified: false,
            isDeletedInstances: false,
            isOrderChanged: false,
            fieldLevelCustomizations: false,
        }),
    };
});

vi.mock("../../utils/getDiscussionIdByFieldMetaData", () => {
    return {
        getDiscussionIdByFieldMetaData: vi.fn().mockResolvedValue({
            uid: "discussionId",
        }),
    };
});

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

const mockMultipleFieldMetadata: CslpData = {
    entry_uid: "",
    content_type_uid: "",
    cslpValue: "",
    locale: "",
    variant: undefined,
    fieldPath: "",
    fieldPathWithIndex: "group.link",
    multipleFieldMetadata: {
        index: 0,
        parentDetails: {
            parentPath: "group",
            parentCslpValue: "entry.contentType.locale",
        },
    },
    instance: {
        fieldPathWithIndex: "group.link.0",
    },
};

describe("FieldToolbarComponent", () => {
    let targetElement: HTMLDivElement;
    let mockEventDetails: VisualBuilderCslpEventDetails;

    beforeAll(() => {
        // Mock FieldSchemaMap once for all tests
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
            mockMultipleLinkFieldSchema
        );
    });

    beforeEach(() => {
        document.getElementsByTagName("html")[0].innerHTML = "";
        targetElement = document.createElement("div");
        targetElement.setAttribute("data-testid", "mock-target-element");
        document.body.appendChild(targetElement);

        // Create fresh mockEventDetails for each test to avoid state pollution
        mockEventDetails = {
            fieldMetadata: mockMultipleFieldMetadata,
            editableElement: targetElement,
            cslpData: "",
        };

        // Reset mocks to default state
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            reason: "",
        });
        vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue(
            mockMultipleLinkFieldSchema
        );
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    // REMOVED: "renders toolbar buttons correctly" - redundant test
    // This test only checks that buttons exist, which is already covered by the click handler tests below.
    // The click tests verify buttons exist AND work correctly, making this test unnecessary.

    test("calls handleMoveInstance with 'previous' when move left button is clicked", async () => {
        const { container } = render(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use queryByTestId + waitFor for faster detection (fails immediately if not found)
        const moveLeftButton = await waitFor(
            () => {
                const button = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"]'
                ) as HTMLElement;
                if (!button) throw new Error("Button not found");
                return button;
            },
            { timeout: 2000, interval: 10 } // Reduced timeout from 5s to 2s
        );

        fireEvent.click(moveLeftButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "previous"
        );
    });

    test("calls handleMoveInstance with 'next' when move right button is clicked", async () => {
        const { container } = render(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use queryByTestId + waitFor for faster detection
        const moveRightButton = await waitFor(
            () => {
                const button = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"]'
                ) as HTMLElement;
                if (!button) throw new Error("Button not found");
                return button;
            },
            { timeout: 2000, interval: 10 } // Reduced timeout from 5s to 2s
        );

        fireEvent.click(moveRightButton);

        expect(handleMoveInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata,
            "next"
        );
    });

    test("calls handleDeleteInstance when delete button is clicked", async () => {
        const { container } = render(
            <FieldToolbarComponent
                eventDetails={mockEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Use queryByTestId + waitFor for faster detection
        const deleteButton = await waitFor(
            () => {
                const button = container.querySelector(
                    '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"]'
                ) as HTMLElement;
                if (!button) throw new Error("Button not found");
                return button;
            },
            { timeout: 2000, interval: 10 } // Reduced timeout from 5s to 2s
        );

        fireEvent.click(deleteButton);

        expect(handleDeleteInstance).toHaveBeenCalledWith(
            mockMultipleFieldMetadata
        );
    });

    test("display variant icon instead of dropdown", async () => {
        // Create a fresh copy with variant set to avoid mutation issues
        const variantEventDetails = {
            ...mockEventDetails,
            fieldMetadata: {
                ...mockEventDetails.fieldMetadata,
                variant: "variant",
            },
        };

        const { container } = render(
            <FieldToolbarComponent
                eventDetails={variantEventDetails}
                hideOverlay={vi.fn()}
            />
        );

        // Wait for async operations to complete (fieldSchema and variantStatus)
        // The icon appears after both FieldSchemaMap.getFieldSchema() and getFieldVariantStatus() complete
        await waitFor(
            () => {
                const icon = container.querySelector(
                    '[data-testid="visual-builder-canvas-variant-icon"]'
                );
                if (!icon) throw new Error("Variant icon not found");
                expect(icon).toBeInTheDocument();
            },
            { timeout: 1000, interval: 10 } // Reduced timeout since mocks resolve immediately
        );
    });

    describe("'Replace button' visibility for multiple file fields", () => {
        beforeEach(() => {
            // Override the mock for this describe block (must be beforeEach to override outer beforeEach)
            vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue(
                mockMultipleFileFieldSchema
            );
        });

        afterEach(() => {
            // Restore will happen in outer afterEach via clearAllMocks
        });

        test("'replace button' is hidden for parent wrapper of multiple file field", async () => {
            const parentWrapperMetadata: CslpData = {
                ...mockMultipleFieldMetadata,
                fieldPathWithIndex: "files",
                instance: {
                    fieldPathWithIndex: "files",
                },
            };

            const parentWrapperEventDetails = {
                ...mockEventDetails,
                fieldMetadata: parentWrapperMetadata,
            };

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={parentWrapperEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            // Wait for component to render, then check button is not present
            await waitFor(
                () => {
                    // Wait for toolbar to render first
                    const toolbar = container.querySelector(
                        '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar"]'
                    );
                    if (!toolbar) throw new Error("Toolbar not found");
                    
                    const replaceButton = container.querySelector(
                        '[data-testid="visual-builder-replace-file"]'
                    );
                    expect(replaceButton).not.toBeInTheDocument();
                },
                { timeout: 2000, interval: 10 } // Reduced timeout from 10s to 2s
            );
        });

        test("'replace button' is visible for individual field in multiple file field", async () => {
            const individualFieldMetadata: CslpData = {
                ...mockMultipleFieldMetadata,
                fieldPathWithIndex: "files",
                instance: {
                    fieldPathWithIndex: "files.0",
                },
            };

            const individualFieldEventDetails = {
                ...mockEventDetails,
                fieldMetadata: individualFieldMetadata,
            };

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={individualFieldEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            // Wait for component to render and load async data
            await waitFor(
                () => {
                    const replaceButton = container.querySelector(
                        '[data-testid="visual-builder-replace-file"]'
                    );
                    if (!replaceButton) throw new Error("Replace button not found");
                    expect(replaceButton).toBeInTheDocument();
                },
                { timeout: 2000, interval: 10 } // Reduced timeout from 10s to 2s
            );
        });

        test("passes disabled state correctly to child components when field is disabled", async () => {
            // Mock isFieldDisabled to return disabled state
            vi.mocked(isFieldDisabled).mockReturnValue({
                isDisabled: true,
                reason: "You have only read access to this field" as any,
            });

            const { container } = render(
                <FieldToolbarComponent
                    eventDetails={mockEventDetails}
                    hideOverlay={vi.fn()}
                />
            );

            await waitFor(
                () => {
                    const toolbar = container.querySelector(
                        '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar"]'
                    );
                    if (!toolbar) throw new Error("Toolbar not found");

                    // Check that move buttons are disabled
                    const moveLeftButton = container.querySelector(
                        '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"]'
                    );
                    const moveRightButton = container.querySelector(
                        '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"]'
                    );
                    const deleteButton = container.querySelector(
                        '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"]'
                    );

                    if (!moveLeftButton || !moveRightButton || !deleteButton) {
                        throw new Error("Buttons not found");
                    }

                    expect(moveLeftButton).toBeDisabled();
                    expect(moveRightButton).toBeDisabled();
                    expect(deleteButton).toBeDisabled();

                    // Check that edit button is disabled if present
                    const editButton = container.querySelector(
                        '[data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__edit-button"]'
                    );
                    if (editButton) {
                        expect(editButton).toBeDisabled();
                    }

                    // Check that replace button is disabled if present
                    const replaceButton = container.querySelector(
                        '[data-testid="visual-builder-replace-file"]'
                    );
                    if (replaceButton) {
                        expect(replaceButton).toBeDisabled();
                    }
                },
                { timeout: 2000, interval: 10 } // Reduced timeout from 10s to 2s
            );
        });
    });
});
