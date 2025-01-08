import { asyncRender } from "../../../__test__/utils";
import { CslpData } from "../../../cslp/types/cslp.types";
import {
    FieldRevertComponent,
    VariantRevertDropdown,
} from "../FieldRevert/FieldRevertComponent";
import { describe, it, expect, vi } from "vitest";

const sendMock = vi.hoisted(() =>
    vi.fn().mockImplementation((_eventName: string) => {
        return Promise.resolve({});
    })
);
vi.mock("../../utils/visualBuilderPostMessage", async () => {
    return {
        default: {
            send: sendMock,
            on: vi.fn(),
        },
    };
});
describe("VariantRevertDropdown", () => {
    it("should render correctly when there are no dropdown items", async () => {
        const { findByTestId } = await asyncRender(
            <VariantRevertDropdown
                closeDropdown={vi.fn()}
                invertTooltipPosition={false}
                toggleVariantDropdown={vi.fn()}
                variantStatus={{
                    isAddedInstances: false,
                    isBaseModified: false,
                    isDeletedInstances: false,
                    isOrderChanged: false,
                    fieldLevelCustomizations: false,
                }}
            />
        );

        const button = await findByTestId("visual-builder-canvas-variant-icon");
        expect(button).toBeInTheDocument();
    });

    it("should render correctly when there are dropdown items", async () => {
        const { findByTestId } = await asyncRender(
            <VariantRevertDropdown
                closeDropdown={vi.fn()}
                invertTooltipPosition={false}
                toggleVariantDropdown={vi.fn()}
                variantStatus={{
                    isAddedInstances: true,
                    isBaseModified: true,
                    isDeletedInstances: true,
                    isOrderChanged: true,
                    fieldLevelCustomizations: true,
                }}
            />
        );

        const button = await findByTestId(
            "visual-builder-canvas-variant-revert"
        );
        expect(button).toBeInTheDocument();
    });

    it("should render correctly with mixed variantStatus", async () => {
        const { findByTestId } = await asyncRender(
            <VariantRevertDropdown
                closeDropdown={vi.fn()}
                invertTooltipPosition={false}
                toggleVariantDropdown={vi.fn()}
                variantStatus={{
                    isAddedInstances: true,
                    isBaseModified: false,
                    isDeletedInstances: true,
                    isOrderChanged: false,
                    fieldLevelCustomizations: true,
                }}
                fieldDataName="fieldDataName"
            />
        );

        const button = await findByTestId(
            "visual-builder-canvas-variant-revert"
        );
        expect(button).toBeInTheDocument();
    });

    it("should call toggleVariantDropdown when button is clicked", async () => {
        const toggleVariantDropdown = vi.fn();
        const { findByTestId } = await asyncRender(
            <VariantRevertDropdown
                closeDropdown={vi.fn()}
                invertTooltipPosition={false}
                toggleVariantDropdown={toggleVariantDropdown}
                variantStatus={{
                    isAddedInstances: true,
                    isBaseModified: true,
                    isDeletedInstances: true,
                    isOrderChanged: true,
                    fieldLevelCustomizations: true,
                }}
            />
        );

        const button = await findByTestId(
            "visual-builder-canvas-variant-revert"
        );
        button.click();
        expect(toggleVariantDropdown).toHaveBeenCalled();
    });

    it("should close dropdown when clicking outside", async () => {
        const closeDropdown = vi.fn();
        const { container } = await asyncRender(
            <VariantRevertDropdown
                closeDropdown={closeDropdown}
                invertTooltipPosition={false}
                toggleVariantDropdown={vi.fn()}
                variantStatus={{
                    isAddedInstances: true,
                    isBaseModified: true,
                    isDeletedInstances: true,
                    isOrderChanged: true,
                    fieldLevelCustomizations: true,
                }}
            />
        );

        document.dispatchEvent(new MouseEvent("mousedown"));
        expect(closeDropdown).toHaveBeenCalled();
    });
});

const mockMultipleFieldMetadata: CslpData = {
    entry_uid: "",
    content_type_uid: "",
    cslpValue: "",
    locale: "",
    variant: "variant",
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
describe("FieldRevertComponent", () => {
    it("should render correctly when there are no dropdown items", async () => {
        const { findByTestId } = await asyncRender(
            <FieldRevertComponent
                closeDropdown={vi.fn()}
                fieldDataName="fieldDataName"
                fieldMetadata={mockMultipleFieldMetadata}
                isOpen={true}
                variantStatus={{
                    isAddedInstances: false,
                    isBaseModified: false,
                    isDeletedInstances: false,
                    isOrderChanged: false,
                    fieldLevelCustomizations: false,
                }}
            />
        );

        const dropdown = await findByTestId(
            "variant-field-revert-component__dropdown-content"
        );
        expect(dropdown).toBeInTheDocument();
        expect(dropdown).toBeEmptyDOMElement();
    });
    it("should render correctly when there are dropdown items", async () => {
        const { findByTestId } = await asyncRender(
            <FieldRevertComponent
                closeDropdown={vi.fn()}
                fieldDataName="fieldDataName"
                fieldMetadata={mockMultipleFieldMetadata}
                isOpen={true}
                variantStatus={{
                    isAddedInstances: true,
                    isBaseModified: false,
                    isDeletedInstances: true,
                    isOrderChanged: false,
                    fieldLevelCustomizations: true,
                }}
            />
        );

        const dropdown = await findByTestId(
            "variant-field-revert-component__dropdown-content"
        );
        expect(dropdown).toBeInTheDocument();
        const revert_added_instances = await findByTestId(
            "iframe-cs-variant-field-fieldDataName-revert-added-instances"
        );
        const restore_deleted_instances = await findByTestId(
            "iframe-cs-variant-field-fieldDataName-restore-deleted-instances"
        );
        const reset_field_level_customizations = await findByTestId(
            "iframe-cs-variant-field-fieldDataName-reset-field-level-customizations"
        );
        expect(revert_added_instances).toBeInTheDocument();
        expect(restore_deleted_instances).toBeInTheDocument();
        expect(reset_field_level_customizations).toBeInTheDocument();
    });
    it("should call handleOnClick when dropdown item is clicked", async () => {
        const closeDropdown = vi.fn();
        const handleOnClickMock = vi.fn();
        vi.mock(
            "../FieldRevert/FieldRevertComponent/FieldRevertComponent",
            () => {
                const FieldRevertComponent = vi.importActual(
                    "../FieldRevert/FieldRevertComponent/FieldRevertComponent"
                );

                return {
                    ...FieldRevertComponent,
                    handleOnClick: handleOnClickMock,
                };
            }
        );
        const { findByTestId } = await asyncRender(
            <FieldRevertComponent
                closeDropdown={closeDropdown}
                fieldDataName="fieldDataName"
                fieldMetadata={mockMultipleFieldMetadata}
                isOpen={true}
                variantStatus={{
                    isAddedInstances: true,
                    isBaseModified: false,
                    isDeletedInstances: true,
                    isOrderChanged: false,
                    fieldLevelCustomizations: true,
                }}
            />
        );

        const revertAddedInstances = await findByTestId(
            "iframe-cs-variant-field-fieldDataName-revert-added-instances"
        );
        revertAddedInstances.click();
        expect(sendMock).toHaveBeenCalledWith(
            "send-variant-revert-action-trigger",
            {
                action: "revert_added_instances",
                euid: "",
                ct_uid: "",
                locale: "",
                fieldDataName: "fieldDataName",
            }
        );
        expect(closeDropdown).toHaveBeenCalled();
    });
});
