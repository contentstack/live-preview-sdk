import { describe, it, expect } from "vitest";
import { isCustomFieldMultipleInstance } from "../isCustomFieldMultipleInstance";
import {
    mockMultipleCustomFieldSchema,
    mockSingleCustomFieldSchema,
    mockMultipleLinkFieldSchema,
} from "../../../__test__/data/fields";
import { CslpData } from "../../../cslp/types/cslp.types";

const instanceMetadata: CslpData = {
    entry_uid: "entry",
    content_type_uid: "ct",
    cslpValue: "",
    locale: "en-us",
    variant: undefined,
    fieldPath: "custom_field",
    fieldPathWithIndex: "custom_field",
    multipleFieldMetadata: {
        index: 0,
        parentDetails: {
            parentPath: "custom_field",
            parentCslpValue: "entry.ct.en-us",
        },
    },
    instance: {
        fieldPathWithIndex: "custom_field.0",
    },
};

const wholeFieldMetadata: CslpData = {
    ...instanceMetadata,
    fieldPathWithIndex: "custom_field",
    instance: { fieldPathWithIndex: "custom_field" },
};

const wholeFieldByIndexMetadata: CslpData = {
    ...instanceMetadata,
    multipleFieldMetadata: {
        index: -1,
        parentDetails: instanceMetadata.multipleFieldMetadata!.parentDetails,
    },
};

describe("isCustomFieldMultipleInstance", () => {
    it("returns true for a multiple custom field instance", () => {
        expect(
            isCustomFieldMultipleInstance(mockMultipleCustomFieldSchema, instanceMetadata)
        ).toBe(true);
    });

    it("returns false when whole field is selected (same paths)", () => {
        expect(
            isCustomFieldMultipleInstance(mockMultipleCustomFieldSchema, wholeFieldMetadata)
        ).toBe(false);
    });

    it("returns false when whole field is selected (index === -1)", () => {
        expect(
            isCustomFieldMultipleInstance(mockMultipleCustomFieldSchema, wholeFieldByIndexMetadata)
        ).toBe(false);
    });

    it("returns false for a single (non-multiple) custom field", () => {
        expect(
            isCustomFieldMultipleInstance(mockSingleCustomFieldSchema, instanceMetadata)
        ).toBe(false);
    });

    it("returns false for a non-custom multiple field (e.g. link)", () => {
        expect(
            isCustomFieldMultipleInstance(mockMultipleLinkFieldSchema, instanceMetadata)
        ).toBe(false);
    });
});
