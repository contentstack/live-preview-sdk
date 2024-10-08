import classNames from "classnames";
import React, { useState, useRef, useEffect } from "preact/compat";
import { visualBuilderStyles } from "../../visualBuilder.style";
import { VariantIcon } from "../icons/variant";
import { CaretIcon } from "../icons";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";

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
    // actionCallback: (callbackType: TFieldRevertActionCallback) => void;
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
    fieldPathWithIndex: string
): Promise<IVariantStatus | undefined> {
    try {
        const result = await visualBuilderPostMessage?.send<IVariantStatus>(
            "get-field-variant-status",
            fieldPathWithIndex
        );
        return result;
    } catch (error) {
        console.error("Failed to get field variant status:", error);
    }
}

export const FieldRevertComponent = ({
    fieldDataName,
    variantStatus = BASE_VARIANT_STATUS,
}: FieldRevertComponentProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

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
            <button
                className={classNames(
                    "variant-field-revert-component__dropdown-button",
                    visualBuilderStyles()[
                        "variant-field-revert-component__dropdown-button"
                    ]
                )}
                onClick={toggleDropdown}
                data-testid={`iframe-cs-variant-field-${fieldDataName}-revert-btn`}
            >
                <VariantIcon />
                {"Variant field"}
                <CaretIcon open={isOpen} />
            </button>
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
                                setIsOpen(false);
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
