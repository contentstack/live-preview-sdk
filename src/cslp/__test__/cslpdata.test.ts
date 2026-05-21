import { addCslpOutline, extractDetailsFromCslp, isValidCslp } from "../cslpdata";
import Config from "../../configManager/configManager";

describe("isValidCslp", () => {
    describe("valid cases", () => {
        test("should return true for valid v1 format with 3 parts", () => {
            expect(
                isValidCslp("content_type_uid.entry_uid.locale")
            ).toBeTruthy();
        });

        test("should return true for valid v1 format with field path", () => {
            expect(
                isValidCslp("content_type_uid.entry_uid.locale.field_path")
            ).toBeTruthy();
        });

        test("should return true for valid v2 format with 3 parts", () => {
            expect(
                isValidCslp("v2:content_type_uid.entry_uid_variant_uid.locale")
            ).toBeTruthy();
        });

        test("should return true for valid v2 format with field path", () => {
            expect(
                isValidCslp(
                    "v2:content_type_uid.entry_uid_variant_uid.locale.field_path"
                )
            ).toBeTruthy();
        });
    });

    describe("invalid cases", () => {
        test("should return false for null", () => {
            expect(isValidCslp(null)).toBeFalsy();
        });

        test("should return false for undefined", () => {
            expect(isValidCslp(undefined)).toBeFalsy();
        });

        test("should return false for empty string", () => {
            expect(isValidCslp("")).toBeFalsy();
        });

        test("should return false for string with less than 3 parts", () => {
            expect(isValidCslp("invalid")).toBeFalsy();
        });

        test("should return false for string with only 2 parts", () => {
            expect(isValidCslp("a.b")).toBeFalsy();
        });

        test("should return false for v2 prefix with no data", () => {
            expect(isValidCslp("v2:")).toBeFalsy();
        });

        test("should return false for v2 prefix with only 2 parts", () => {
            expect(isValidCslp("v2:a.b")).toBeFalsy();
        });

        test("should return false for v2 format where entry_uid_variant_uid has no underscore", () => {
            expect(
                isValidCslp("v2:content_type_uid.entry.locale")
            ).toBeFalsy();
        });

        test("should return false for v2 format where entry_uid_variant_uid is missing variant_uid", () => {
            expect(
                isValidCslp("v2:content_type_uid.entry_.locale")
            ).toBeFalsy();
        });

        test("should return false for v2 format where entry_uid_variant_uid is missing entry_uid", () => {
            expect(
                isValidCslp("v2:content_type_uid._variant_uid.locale")
            ).toBeFalsy();
        });

        test("should return false for v2 format with empty parts", () => {
            expect(isValidCslp("v2:..locale")).toBeFalsy();
        });

        test("should return false for v2 format with empty content_type_uid", () => {
            expect(isValidCslp("v2:.entry_uid_variant_uid.locale")).toBeFalsy();
        });

        test("should return false for v2 format with empty locale", () => {
            expect(
                isValidCslp("v2:content_type_uid.entry_uid_variant_uid.")
            ).toBeFalsy();
        });

        test("should return false for v1 format with empty parts", () => {
            expect(isValidCslp("..locale")).toBeFalsy();
        });

        test("should return false for v1 format with empty content_type_uid", () => {
            expect(isValidCslp(".entry_uid.locale")).toBeFalsy();
        });

        test("should return false for v1 format with empty entry_uid", () => {
            expect(isValidCslp("content_type_uid..locale")).toBeFalsy();
        });

        test("should return false for whitespace-only string", () => {
            expect(isValidCslp("   ")).toBeFalsy();
        });

        test("should return false for tab and newline whitespace", () => {
            expect(isValidCslp("\t\n")).toBeFalsy();
        });

        test("should return false for string with only dots", () => {
            expect(isValidCslp("...")).toBeFalsy();
        });

        test("should return false for string with only two dots", () => {
            expect(isValidCslp("..")).toBeFalsy();
        });
    });
});

describe("extractDetailsFromCslp", () => {
    test("should extract details from a CSLP value string with nested multiple field", () => {
        const cslpValue =
            "content_type_uid.entry_uid.locale.field1.field2.0.field3";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue:
                "content_type_uid.entry_uid.locale.field1.field2.0.field3",
            fieldPath: "field1.field2.field3",
            fieldPathWithIndex: "field1.field2.0.field3",
            multipleFieldMetadata: {
                parentDetails: {
                    parentPath: "field1.field2",
                    parentCslpValue:
                        "content_type_uid.entry_uid.locale.field1.field2",
                },
                index: 0,
            },
            instance: {
                fieldPathWithIndex: "field1.field2.0.field3",
            }
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });

    test("should handle a CSLP value string with no multiple field", () => {
        const cslpValue =
            "content_type_uid.entry_uid.locale.field1.field2.field3";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue: "content_type_uid.entry_uid.locale.field1.field2.field3",
            fieldPath: "field1.field2.field3",
            fieldPathWithIndex: "field1.field2.field3",
            multipleFieldMetadata: {
                parentDetails: null,
                index: -1,
            },
            instance: {
                fieldPathWithIndex: "field1.field2.field3",
            }
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });

    test("should handle a CSLP value string with one level multiple field", () => {
        const cslpValue = "content_type_uid.entry_uid.locale.field.0";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue: "content_type_uid.entry_uid.locale.field.0",
            fieldPath: "field",
            fieldPathWithIndex: "field",
            multipleFieldMetadata: {
                parentDetails: {
                    parentCslpValue: "content_type_uid.entry_uid.locale.field",
                    parentPath: "field",
                },
                index: 0,
            },
            instance: {
                fieldPathWithIndex: "field.0",
            }
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });

    test("should handle a CSLP value string with nested group field", () => {
        const cslpValue =
            "content_type_uid.entry_uid.locale.field1.0.field3.field4.3";
        const expected = {
            entry_uid: "entry_uid",
            content_type_uid: "content_type_uid",
            locale: "locale",
            cslpValue:
                "content_type_uid.entry_uid.locale.field1.0.field3.field4.3",
            fieldPath: "field1.field3.field4",
            fieldPathWithIndex: "field1.0.field3.field4",
            multipleFieldMetadata: {
                parentDetails: {
                    parentCslpValue:
                        "content_type_uid.entry_uid.locale.field1.0.field3.field4",
                    parentPath: "field1.0.field3.field4",
                },
                index: 3,
            },
            instance: {
                fieldPathWithIndex: "field1.0.field3.field4.3",
            }
        };
        expect(extractDetailsFromCslp(cslpValue)).toEqual(expected);
    });
});

describe("addCslpOutline — overlayPropagation fallback", () => {
    const CSLP = "ct.entry.en-us.field";

    function makeEvent(x = 10, y = 10, target?: HTMLElement): MouseEvent {
        return {
            composedPath: () => (target ? [target, document.body] : [document.body]),
            clientX: x,
            clientY: y,
        } as unknown as MouseEvent;
    }

    beforeEach(() => {
        Config.reset();
        document.body.innerHTML = "";
    });

    afterEach(() => {
        Config.reset();
        vi.restoreAllMocks();
    });

    test("does NOT call elementsFromPoint when flag is off and composedPath finds element", () => {
        const el = document.createElement("div");
        el.setAttribute("data-cslp", CSLP);
        document.body.appendChild(el);
        const spy = vi.spyOn(document, "elementsFromPoint");

        Config.set("overlayPropagation", { enable: false });
        addCslpOutline(makeEvent(10, 10, el));

        expect(spy).not.toHaveBeenCalled();
    });

    test("calls elementsFromPoint fallback when flag is ON and composedPath misses cslp", () => {
        const el = document.createElement("div");
        el.setAttribute("data-cslp", CSLP);
        document.body.appendChild(el);

        Config.set("overlayPropagation", { enable: true });
        vi.spyOn(document, "elementsFromPoint").mockReturnValue([el]);

        const callback = vi.fn();
        addCslpOutline(makeEvent(10, 10), callback);

        expect(document.elementsFromPoint).toHaveBeenCalledWith(10, 10);
        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ cslpTag: CSLP, highlightedElement: el })
        );
    });

    test("fallback finds no cslp element — callback not called", () => {
        const blocker = document.createElement("div");
        document.body.appendChild(blocker);

        Config.set("overlayPropagation", { enable: true });
        vi.spyOn(document, "elementsFromPoint").mockReturnValue([blocker]);

        const callback = vi.fn();
        addCslpOutline(makeEvent(10, 10), callback);

        expect(callback).not.toHaveBeenCalled();
    });
});
