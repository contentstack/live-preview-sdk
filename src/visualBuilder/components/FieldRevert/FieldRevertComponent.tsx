import classNames from "classnames";
import React, { useRef, useEffect } from "preact/compat";
import { visualBuilderStyles } from "../../visualBuilder.style";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { CslpData } from "../../../cslp/types/cslp.types";

export interface IVariantStatus {
    fieldLevelCustomizations: boolean;
    isBaseModified: boolean;
    isAddedInstances: boolean;
    isDeletedInstances: boolean;
    isOrderChanged: boolean;
}

export type TFieldRevertActionCallback =
    | "revert_to_base_entry_value"
    | "revert_added_instances"
    | "restore_deleted_instances"
    | "reset_field_level_customizations"
    | "restore_sorted_instances";

interface FieldRevertComponentProps {
    fieldDataName: string;
    fieldMetadata: CslpData;
    isOpen: boolean;
    closeDropdown: () => void;
    variantStatus?: IVariantStatus;
}

interface IItem {
    label: string;
    action: TFieldRevertActionCallback;
    id: string;
    testId: string;
    fieldDataName: string;
}

export const BASE_VARIANT_STATUS: IVariantStatus = {
    isAddedInstances: false,
    isBaseModified: false,
    isDeletedInstances: false,
    isOrderChanged: false,
    fieldLevelCustomizations: false,
};

export async function getFieldVariantStatus(
    fieldMetadata: CslpData
): Promise<IVariantStatus | undefined> {
    try {
        const result = await visualBuilderPostMessage?.send<IVariantStatus>(
            "get-field-variant-status",
            fieldMetadata
        );
        return result;
    } catch (error) {
        console.error("Failed to get field variant status:", error);
    }
}

export const FieldRevertComponent = (props: FieldRevertComponentProps) => {
    const {
        fieldDataName,
        fieldMetadata,
        variantStatus = BASE_VARIANT_STATUS,
        isOpen,
        closeDropdown,
    } = props;
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                closeDropdown();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getDropdownItems = () => {
        const {
            isAddedInstances,
            isDeletedInstances,
            isBaseModified,
            isOrderChanged,
            fieldLevelCustomizations,
        } = variantStatus;

        const dropdownItems: IItem[] = [];

        if (isBaseModified) {
            dropdownItems.push({
                label: "Revert to base entry value",
                action: "revert_to_base_entry_value",
                id: `iframe-cs-variant-field-${fieldDataName}-revert`,
                testId: `iframe-cs-variant-field-${fieldDataName}-revert`,
                fieldDataName,
            });
        }

        if (isAddedInstances) {
            dropdownItems.push({
                label: "Revert added instances",
                action: "revert_added_instances",
                id: `iframe-cs-variant-field-${fieldDataName}-revert-added-instances`,
                testId: `iframe-cs-variant-field-${fieldDataName}-revert-added-instances`,
                fieldDataName,
            });
        }

        if (isDeletedInstances) {
            dropdownItems.push({
                label: "Restore deleted instances",
                action: "restore_deleted_instances",
                id: `iframe-cs-variant-field-${fieldDataName}-restore-deleted-instances`,
                testId: `iframe-cs-variant-field-${fieldDataName}-restore-deleted-instances`,
                fieldDataName,
            });
        }

        if (fieldLevelCustomizations) {
            dropdownItems.push({
                label: "Reset field-level customizations",
                action: "reset_field_level_customizations",
                id: `iframe-cs-variant-field-${fieldDataName}-reset-field-level-customizations`,
                testId: `iframe-cs-variant-field-${fieldDataName}-reset-field-level-customizations`,
                fieldDataName,
            });
        }

        if (isOrderChanged) {
            dropdownItems.push({
                label: "Restore sorted instances",
                action: "restore_sorted_instances",
                id: `iframe-cs-variant-field-${fieldDataName}-restore-sorted-instances`,
                testId: `iframe-cs-variant-field-${fieldDataName}-restore-sorted-instances`,
                fieldDataName,
            });
        }

        return dropdownItems;
    };

    const dropdownItems = getDropdownItems();

    function handleOnClick(item: IItem) {
        const { fieldDataName, action } = item;
        visualBuilderPostMessage?.send("send-variant-revert-action-trigger", {
            fieldDataName,
            action,
            euid: fieldMetadata.entry_uid,
            ct_uid: fieldMetadata.content_type_uid,
            locale: fieldMetadata.locale,
        });
    }

    return (
        <div
            className={classNames(
                "variant-field-revert-component",
                visualBuilderStyles()["variant-field-revert-component"]
            )}
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
        >
            {isOpen && (
                <div
                    className={classNames(
                        "variant-field-revert-component__dropdown-content",
                        visualBuilderStyles()[
                            "variant-field-revert-component__dropdown-content"
                        ]
                    )}
                >
                    {dropdownItems.map((item) => (
                        <div
                            className={classNames(
                                "variant-field-revert-component__dropdown-content__list-item",
                                visualBuilderStyles()[
                                    "variant-field-revert-component__dropdown-content__list-item"
                                ]
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                handleOnClick(item);
                                closeDropdown();
                            }}
                            key={item.id}
                            data-testid={item.testId}
                        >
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
