import { describe, it, expect } from 'vitest';
import { isFieldDisabled } from '../isFieldDisabled';
import { ISchemaFieldMap } from '../types/index.types';
import { FieldDetails } from '../../components/FieldToolbar';
import Config from '../../../configManager/configManager';
import { VisualBuilder } from '../..';

describe('isFieldDisabled', () => {
    it('should return disabled state due to read-only role', () => {
        const fieldSchemaMap: ISchemaFieldMap = {
            field_metadata: {
                updateRestrict: true,
            },
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement('div'),
            fieldMetadata: {
                locale: 'en-us',
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe('You have only read access to this field');
    });

    it('should return disabled state due to non-localizable fields', () => {
        Config.get = () => ({
            stackDetails: {
                masterLocale: 'en-us',
            },
        });

        const fieldSchemaMap: ISchemaFieldMap = {
            non_localizable: true,
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement('div'),
            fieldMetadata: {
                locale: 'fr-fr',
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe('Editing this field is restricted in localized entries');
    });

    it('should return disabled state due to unlinked variant', () => {
        const fieldSchemaMap: ISchemaFieldMap = {
            field_metadata: {
                isUnlinkedVariant: true,
            },
        };
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement('div'),
            fieldMetadata: {
                locale: 'en-us',
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe('This field is not editable as it is not linked to the selected variant');
    });

    it('should return disabled state due to unlocalized variant', () => {
        VisualBuilder.VisualBuilderGlobalState = {
            value: {
                locale: 'en-us',
                variant: true,
            },
        };

        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement('div'),
            fieldMetadata: {
                locale: 'fr-fr',
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe('This field is not editable as it is not localized');
    });

    it('should return disabled state due to audience mode', () => {
        VisualBuilder.VisualBuilderGlobalState = {
            value: {
                audienceMode: true,
            },
        };

        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement('div'),
            fieldMetadata: {
                locale: 'en-us',
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe('Open an Experience from Audience widget to start editing');
    });

    it('should return disabled state due to disabled variant', () => {
        VisualBuilder.VisualBuilderGlobalState = {
            value: {
                audienceMode: true,
            },
        };

        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement('div'),
            fieldMetadata: {
                locale: 'en-us',
            },
        };
        eventFieldDetails.editableElement.classList.add('visual-builder__disabled-variant-field');

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(true);
        expect(result.reason).toBe('This field is not editable as it doesn\'t match the selected variant');
        VisualBuilder.VisualBuilderGlobalState = {
            value: {
                audienceMode: false,
            },
        };
    });

    it('should return enabled state when no restrictions apply', () => {
        const fieldSchemaMap: ISchemaFieldMap = {};
        const eventFieldDetails: FieldDetails = {
            editableElement: document.createElement('div'),
            fieldMetadata: {
                locale: 'en-us',
            },
        };

        const result = isFieldDisabled(fieldSchemaMap, eventFieldDetails);
        expect(result.isDisabled).toBe(false);
        expect(result.reason).toBe('');
    });
    
    it('should return disabled state due to read-only role', () => {
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

});
