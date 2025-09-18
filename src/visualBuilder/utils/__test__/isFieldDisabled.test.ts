import { describe, it, expect } from "vitest";
import { isFieldDisabled } from "../isFieldDisabled";
import { ISchemaFieldMap } from "../types/index.types";
import { FieldDetails } from "../../components/FieldToolbar";
import Config from "../../../configManager/configManager";
import { VisualBuilder } from "../..";
import { EntryPermissions } from "../getEntryPermissions";

describe("isFieldDisabled", () => {
    it("should return disabled state due to read-only role", () => {
        // @ts-expect-error mocking only required properties
        const fieldSchemaMap: ISchemaFieldMap = {
            field_metadata: {
                updateRestrict: true,
            },
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                locale: "en-us",
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe("You have only read access to this field");
    });

    it("should return disabled state due to non-localizable fields", () => {
        Config.get = () => ({
            // @ts-expect-error mocking only required properties
            stackDetails: {
                masterLocale: "en-us",
            },
        });

        // @ts-expect-error mocking only required properties
        const fieldSchemaMap: ISchemaFieldMap = {
            non_localizable: true,
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                locale: "fr-fr",
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe(
            "Editing this field is restricted in localized entries"
        );
    });

    it("should return disabled state due to unlinked variant", () => {
        // @ts-expect-error mocking only required properties
        const fieldSchemaMap: ISchemaFieldMap = {
            field_metadata: {
                isUnlinkedVariant: true,
            },
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                locale: "en-us",
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe(
            "This field is not editable as it is not linked to the selected variant"
        );
    });

    it("should return disabled state due to unlocalized variant", () => {
        VisualBuilder.VisualBuilderGlobalState = {
            // @ts-expect-error mocking only required properties
            value: {
                locale: "en-us",
                variant: "default",
            },
        };

        // @ts-expect-error mocking only required properties
        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                locale: "fr-fr",
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe(
            "This field is not editable as it is not localized"
        );
    });

    it("should return disabled state due to audience mode", () => {
        VisualBuilder.VisualBuilderGlobalState = {
            // @ts-expect-error mocking only required properties
            value: {
                audienceMode: true,
            },
        };

        // @ts-expect-error mocking only required properties
        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                locale: "en-us",
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe(
            "To edit an experience, open the Audience widget and click the Edit icon."
        );
    });

    it("should return disabled state due to disabled variant", () => {
        VisualBuilder.VisualBuilderGlobalState = {
            // @ts-expect-error mocking only required properties
            value: {
                audienceMode: true,
            },
        };

        // @ts-expect-error mocking only required properties
        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                locale: "en-us",
            },
        };
        eventFieldDetails.editableElement.classList.add(
            "visual-builder__disabled-variant-field"
        );

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe(
            "This field is not editable as it doesn't match the selected variant"
        );
        VisualBuilder.VisualBuilderGlobalState = {
            // @ts-expect-error mocking only required properties
            value: {
                audienceMode: false,
            },
        };
    });

    it("should return enabled state when no restrictions apply", () => {
        // @ts-expect-error mocking only required properties
        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                locale: "en-us",
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(false);
        expect(result.reason).toBe("");
    });

    it("should return disabled state due to read-only role", () => {
        const fieldSchemaMap: ISchemaFieldMap = {
            data_type: "block",
            display_name: "Test Block",
            title: "Test Block",
            uid: "test_block",
            schema: [],
            field_metadata: {
                updateRestrict: true,
            },
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            fieldMetadata: {
                locale: "en-us",
                entry_uid: "test_entry",
                content_type_uid: "test_content_type",
                cslpValue: "test_cslp",
                variant: "default",
                fieldPath: "test_field",
                fieldPathWithIndex: "test_field[0]",
                instance: {
                    fieldPathWithIndex: "test_field[0]",
                },
                multipleFieldMetadata: {
                    index: 0,
                    parentDetails: {
                        parentCslpValue: "",
                        parentPath: "",
                    },
                },
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe("You have only read access to this field");
    });

    it("should return disabled state due to entry update restriction", () => {
        const fieldSchemaMap: ISchemaFieldMap = {
            data_type: "block",
            display_name: "Test Block",
            title: "Test Block",
            uid: "test_block",
            schema: [],
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement("div"),
            fieldMetadata: {
                locale: "en-us",
                entry_uid: "test_entry",
                content_type_uid: "test_content_type",
                cslpValue: "test_cslp",
                variant: "default",
                fieldPath: "test_field",
                fieldPathWithIndex: "test_field[0]",
                instance: {
                    fieldPathWithIndex: "test_field[0]",
                },
                multipleFieldMetadata: {
                    index: 0,
                    parentDetails: {
                        parentCslpValue: "",
                        parentPath: "",
                    },
                },
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails, {
            update: false,
            create: true,
            read: true,
            delete: true,
            publish: true,
        });
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe(
            "You do not have permission to edit this entry"
        );
    });

    describe("workflow stage restrictions", () => {
        it("should return disabled state due to workflow stage permission restriction", () => {
            // @ts-expect-error mocking only required properties
            const fieldSchemaMap: ISchemaFieldMap = {};
            const eventFieldDetails: FieldDetails = {
                editableElement: document.createElement("div"),
                // @ts-expect-error mocking only required properties
                fieldMetadata: {
                    locale: "en-us",
                },
            };
            const entryPermissions: EntryPermissions = {
                update: true,
                create: true,
                read: true,
                delete: true,
                publish: true,
            };
            const workflowStageDetails = {
                stage: {
                    name: "Review Stage",
                },
                permissions: {
                    entry: {
                        update: false,
                    },
                },
            };

            const result = isFieldDisabled(
                fieldSchemaMap,
                eventFieldDetails,
                entryPermissions,
                workflowStageDetails
            );
            expect(result.isDisabled).toBe(true);
            expect(result.reason).toBe(
                "You do not have Edit access to this entry on the 'Review Stage' workflow stage"
            );
        });

        it("should return disabled state due to both entry permissions and workflow stage restrictions", () => {
            // @ts-expect-error mocking only required properties
            const fieldSchemaMap: ISchemaFieldMap = {};
            const eventFieldDetails: FieldDetails = {
                editableElement: document.createElement("div"),
                // @ts-expect-error mocking only required properties
                fieldMetadata: {
                    locale: "en-us",
                },
            };
            const entryPermissions: EntryPermissions = {
                update: false,
                create: true,
                read: true,
                delete: true,
                publish: true,
            };
            const workflowStageDetails = {
                stage: {
                    name: "Final Review",
                },
                permissions: {
                    entry: {
                        update: false,
                    },
                },
            };

            const result = isFieldDisabled(
                fieldSchemaMap,
                eventFieldDetails,
                entryPermissions,
                workflowStageDetails
            );
            expect(result.isDisabled).toBe(true);
            expect(result.reason).toBe(
                "Editing is restricted for your role or by the rules for the 'Final Review' stage. Contact your admin for edit access."
            );
        });

        it("should return enabled state when workflow stage allows editing", () => {
            // @ts-expect-error mocking only required properties
            const fieldSchemaMap: ISchemaFieldMap = {};
            const eventFieldDetails: FieldDetails = {
                editableElement: document.createElement("div"),
                // @ts-expect-error mocking only required properties
                fieldMetadata: {
                    locale: "en-us",
                },
            };
            const entryPermissions: EntryPermissions = {
                update: true,
                create: true,
                read: true,
                delete: true,
                publish: true,
            };
            const workflowStageDetails = {
                stage: {
                    name: "Draft",
                },
                permissions: {
                    entry: {
                        update: true,
                    },
                },
            };

            const result = isFieldDisabled(
                fieldSchemaMap,
                eventFieldDetails,
                entryPermissions,
                workflowStageDetails
            );
            expect(result.isDisabled).toBe(false);
            expect(result.reason).toBe("");
        });

        it("should handle workflow stage details with undefined stage name", () => {
            // @ts-expect-error mocking only required properties
            const fieldSchemaMap: ISchemaFieldMap = {};
            const eventFieldDetails: FieldDetails = {
                editableElement: document.createElement("div"),
                // @ts-expect-error mocking only required properties
                fieldMetadata: {
                    locale: "en-us",
                },
            };
            const entryPermissions: EntryPermissions = {
                update: true,
                create: true,
                read: true,
                delete: true,
                publish: true,
            };
            const workflowStageDetails = {
                stage: undefined,
                permissions: {
                    entry: {
                        update: false,
                    },
                },
            };

            const result = isFieldDisabled(
                fieldSchemaMap,
                eventFieldDetails,
                entryPermissions,
                workflowStageDetails
            );
            expect(result.isDisabled).toBe(true);
            expect(result.reason).toBe(
                "You do not have Edit access to this entry on the 'Unknown' workflow stage"
            );
        });

        it("should handle workflow stage details with missing stage name", () => {
            // @ts-expect-error mocking only required properties
            const fieldSchemaMap: ISchemaFieldMap = {};
            const eventFieldDetails: FieldDetails = {
                editableElement: document.createElement("div"),
                // @ts-expect-error mocking only required properties
                fieldMetadata: {
                    locale: "en-us",
                },
            };
            const entryPermissions: EntryPermissions = {
                update: false,
                create: true,
                read: true,
                delete: true,
                publish: true,
            };
            const workflowStageDetails = {
                stage: {
                    name: undefined,
                },
                permissions: {
                    entry: {
                        update: false,
                    },
                },
            };

            const result = isFieldDisabled(
                fieldSchemaMap,
                eventFieldDetails,
                entryPermissions,
                // @ts-expect-error testing missing name property
                workflowStageDetails
            );
            expect(result.isDisabled).toBe(true);
            expect(result.reason).toBe(
                "Editing is restricted for your role or by the rules for the 'Unknown' stage. Contact your admin for edit access."
            );
        });

        it("should prioritize workflow stage restriction over other restrictions", () => {
            // @ts-expect-error mocking only required properties
            const fieldSchemaMap: ISchemaFieldMap = {
                field_metadata: {
                    updateRestrict: true,
                },
            };
            const eventFieldDetails: FieldDetails = {
                editableElement: document.createElement("div"),
                // @ts-expect-error mocking only required properties
                fieldMetadata: {
                    locale: "en-us",
                },
            };
            const entryPermissions: EntryPermissions = {
                update: true,
                create: true,
                read: true,
                delete: true,
                publish: true,
            };
            const workflowStageDetails = {
                stage: {
                    name: "Protected Stage",
                },
                permissions: {
                    entry: {
                        update: false,
                    },
                },
            };

            const result = isFieldDisabled(
                fieldSchemaMap,
                eventFieldDetails,
                entryPermissions,
                workflowStageDetails
            );
            expect(result.isDisabled).toBe(true);
            // Should return read-only role message first based on getDisableReason logic
            expect(result.reason).toBe(
                "You have only read access to this field"
            );
        });

        it("should return enabled state when no workflow stage details provided", () => {
            // @ts-expect-error mocking only required properties
            const fieldSchemaMap: ISchemaFieldMap = {};
            const eventFieldDetails: FieldDetails = {
                editableElement: document.createElement("div"),
                // @ts-expect-error mocking only required properties
                fieldMetadata: {
                    locale: "en-us",
                },
            };
            const entryPermissions: EntryPermissions = {
                update: true,
                create: true,
                read: true,
                delete: true,
                publish: true,
            };

            const result = isFieldDisabled(
                fieldSchemaMap,
                eventFieldDetails,
                entryPermissions,
                undefined
            );
            expect(result.isDisabled).toBe(false);
            expect(result.reason).toBe("");
        });
    });
});
