import {
    vi,
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    MockedObject,
} from "vitest";
import {
    useVariantFieldsPostMessageEvent,
    addVariantFieldClass,
    removeVariantFieldClass,
    setAudienceMode,
    setVariant,
    setLocale,
    setHighlightVariantFields,
    getHighlightVariantFieldsStatus,
    debounceAddVariantFieldClass,
} from "../../../visualBuilder/eventManager/useVariantsPostMessageEvent";
import { VisualBuilderPostMessageEvents } from "../../../visualBuilder/utils/types/postMessage.types";
import { VisualBuilder } from "../../../visualBuilder";
import { FieldSchemaMap } from "../../../visualBuilder/utils/fieldSchemaMap";
import { visualBuilderStyles } from "../../../visualBuilder/visualBuilder.style";
import visualBuilderPostMessage from "../../../visualBuilder/utils/visualBuilderPostMessage";
import { EventManager } from "@contentstack/advanced-post-message";
import { updateVariantClasses } from "../../../visualBuilder/eventManager/useRecalculateVariantDataCSLPValues";
import * as cslpdata from "../../../cslp/cslpdata";

const mockVisualBuilderPostMessage =
    visualBuilderPostMessage as MockedObject<EventManager>;

// Mock dependencies
vi.mock("../../../visualBuilder/utils/visualBuilderPostMessage", () => {
    return {
        default: {
            on: vi.fn(),
            send: vi.fn(),
        },
    };
});

vi.mock("../../../visualBuilder/utils/fieldSchemaMap", () => {
    return {
        FieldSchemaMap: {
            clear: vi.fn(),
        },
    };
});

vi.mock("../../../visualBuilder/eventManager/useRecalculateVariantDataCSLPValues", () => {
    return {
        updateVariantClasses: vi.fn(),
    };
});

vi.mock("../../../visualBuilder", () => {
    return {
        VisualBuilder: {
            VisualBuilderGlobalState: {
                value: {
                    audienceMode: false,
                    variant: null,
                    locale: "en-us",
                    highlightVariantFields: false,
                },
            },
        },
    };
});

// Create a more realistic mock of the CSS modules
const cssClassMock = "go109692693"; // Match the actual generated class name
const cssOutlineClassMock = "go109692694";

vi.mock("../../visualBuilder.style", () => {
    return {
        visualBuilderStyles: () => ({
            "visual-builder__variant-field": cssClassMock,
            "visual-builder__variant-field-outline": cssOutlineClassMock,
        }),
    };
});

// Mock DOM methods
const mockElements = [
    {
        getAttribute: vi.fn().mockReturnValue("v2:variant-123"),
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
        },
    },
    {
        getAttribute: vi.fn().mockReturnValue("field-without-variant"),
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
        },
    },
    {
        getAttribute: vi.fn().mockReturnValue("v2:variant-456"),
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
        },
    },
];

const mockQuerySelectorAll = vi.fn().mockImplementation((selector) => {
    // Return different mocks based on selector
    if (selector === "[data-cslp]") {
        return mockElements;
    } else if (selector === `.${cssOutlineClassMock}`) {
        return mockElements; // For onlyHighlighted=true case
    } else if (
        selector ===
        ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field, .visual-builder__lower-order-variant-field"
    ) {
        return mockElements; // For onlyHighlighted=false case
    }

    // Default fallback
    return [];
});

describe("useVariantFieldsPostMessageEvent", () => {
    // Store original document.querySelectorAll
    const originalQuerySelectorAll = document.querySelectorAll;

    beforeEach(() => {
        // Mock document.querySelectorAll
        document.querySelectorAll = mockQuerySelectorAll;

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original methods
        document.querySelectorAll = originalQuerySelectorAll;
    });

    it("should register all event listeners", () => {
        // Call the function
        useVariantFieldsPostMessageEvent({ isSSR: false });

        // Verify event listeners are registered
        expect(mockVisualBuilderPostMessage.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_VARIANT_ID,
            expect.any(Function)
        );

        expect(mockVisualBuilderPostMessage.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_LOCALE,
            expect.any(Function)
        );

        expect(mockVisualBuilderPostMessage.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.SET_AUDIENCE_MODE,
            expect.any(Function)
        );

        expect(mockVisualBuilderPostMessage.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.SHOW_VARIANT_FIELDS,
            expect.any(Function)
        );

        expect(mockVisualBuilderPostMessage.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.REMOVE_VARIANT_FIELDS,
            expect.any(Function)
        );
    });

    it("should handle GET_VARIANT_ID event", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent({ isSSR: false });

        // Extract the event handler function
        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.GET_VARIANT_ID
        );
        const handler = call ? call[1] : null;
        expect(handler).not.toBeNull();

        // Call the handler with mock event data
        handler!({ data: { variant: "variant-123" } });

        // Verify the handler sets the variant correctly
        expect(VisualBuilder.VisualBuilderGlobalState.value.variant).toBe(
            "variant-123"
        );

        // Verify FieldSchemaMap.clear was called
        expect(FieldSchemaMap.clear).toHaveBeenCalled();
    });

    it("should handle GET_LOCALE event", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent({ isSSR: false });

        // Extract the event handler function
        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.GET_LOCALE
        );
        const handler = call ? call[1] : null;
        expect(handler).not.toBeNull();

        // Call the handler with mock event data
        handler!({ data: { locale: "fr-fr" } });

        // Verify the handler sets the locale correctly
        expect(VisualBuilder.VisualBuilderGlobalState.value.locale).toBe(
            "fr-fr"
        );
    });

    it("should handle SET_AUDIENCE_MODE event", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent({ isSSR: false });

        // Extract the event handler function
        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.SET_AUDIENCE_MODE
        );
        const handler = call ? call[1] : null;
        expect(handler).not.toBeNull();

        // Call the handler with mock event data
        handler!({ data: { audienceMode: true } });

        // Verify the handler sets the audience mode correctly
        expect(VisualBuilder.VisualBuilderGlobalState.value.audienceMode).toBe(
            true
        );
    });

    it("should handle SHOW_VARIANT_FIELDS event", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent({ isSSR: false });

        // Extract the event handler function
        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.SHOW_VARIANT_FIELDS
        );
        const handler = call ? call[1] : null;
        expect(handler).not.toBeNull();

        // Call the handler with mock event data
        handler!({
            data: {
                variant_data: {
                    variant: "variant-123",
                    highlightVariantFields: true,
                },
            },
        });

        // Verify removeVariantFieldClass was called
        expect(mockQuerySelectorAll).toHaveBeenCalledWith("[data-cslp]");

        // Verify that classes were added to elements correctly
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            "visual-builder__variant-field"
        );
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            visualBuilderStyles()["visual-builder__variant-field-outline"]
        );
    });

    it("should handle REMOVE_VARIANT_FIELDS event with onlyHighlighted=true", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent({ isSSR: false });

        // Extract the event handler function
        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.REMOVE_VARIANT_FIELDS
        );
        const handler = call ? call[1] : null;
        expect(handler).not.toBeNull();

        // Call the handler with mock event data
        handler!({ data: { onlyHighlighted: true } });

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith(
            `.${visualBuilderStyles()["visual-builder__variant-field-outline"]}`
        );

        // Verify that classes were removed from elements correctly
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                visualBuilderStyles()["visual-builder__variant-field-outline"]
            );
        });
    });

    it("should handle REMOVE_VARIANT_FIELDS event with onlyHighlighted=false", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent({ isSSR: false });

        // Extract the event handler function
        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.REMOVE_VARIANT_FIELDS
        );
        const handler = call ? call[1] : null;
        expect(handler).not.toBeNull();

        // Call the handler with mock event data
        handler!({ data: { onlyHighlighted: false } });

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith(
            ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field, .visual-builder__lower-order-variant-field"
        );

        // Verify that classes were removed from elements correctly
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                "visual-builder__disabled-variant-field",
                "visual-builder__variant-field",
                visualBuilderStyles()["visual-builder__variant-field-outline"],
                "visual-builder__base-field",
                "visual-builder__lower-order-variant-field"
            );
        });
    });
});

describe("addVariantFieldClass", () => {
    // Store original document.querySelectorAll
    const originalQuerySelectorAll = document.querySelectorAll;

    beforeEach(() => {
        // Mock document.querySelectorAll
        document.querySelectorAll = mockQuerySelectorAll;

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original methods
        document.querySelectorAll = originalQuerySelectorAll;
    });

    it("should add classes to elements correctly based on data-cslp attribute", () => {
        const variantUid = "variant-123";
        VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields = true;

        addVariantFieldClass(variantUid, []);

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith("[data-cslp]");

        // First element has the variant ID
        expect(mockElements[0].getAttribute).toHaveBeenCalledWith("data-cslp");
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            "visual-builder__variant-field"
        );
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            visualBuilderStyles()["visual-builder__variant-field-outline"]
        );

        // Second element does not start with 'v2:'
        expect(mockElements[1].getAttribute).toHaveBeenCalledWith("data-cslp");
        expect(mockElements[1].classList.add).toHaveBeenCalledWith(
            "visual-builder__base-field"
        );

        // Third element starts with 'v2:' but doesn't match variant
        expect(mockElements[2].getAttribute).toHaveBeenCalledWith("data-cslp");
        expect(mockElements[2].classList.add).toHaveBeenCalledWith(
            "visual-builder__disabled-variant-field"
        );
    });

    it("should not add highlight class when highlightVariantFields is false", () => {
        const variantUid = "variant-123";
        VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields = false;

        addVariantFieldClass(variantUid, []);

        // First element has the variant ID but should not get highlight class
        expect(mockElements[0].getAttribute).toHaveBeenCalledWith("data-cslp");
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            "visual-builder__variant-field"
        );
        expect(mockElements[0].classList.add).not.toHaveBeenCalledWith(
            visualBuilderStyles()["visual-builder__variant-field-outline"]
        );
    });

    it("should handle lower order variant fields correctly", () => {
        // @ts-expect-error mocking only required properties
        vi.spyOn(cslpdata, "extractDetailsFromCslp").mockImplementation((cslpValue) => {
            return {
                variant: cslpValue.split(":")[1]
            }
        });
        const variantUid = "variant-456";
        const variantOrder = ["variant-123", "variant-456"];

        addVariantFieldClass(variantUid, variantOrder);

        // Verify that classes were added to elements correctly
        expect(mockElements[0].classList.add).toHaveBeenCalledWith("visual-builder__variant-field", "visual-builder__lower-order-variant-field");
    });
});

describe("removeVariantFieldClass", () => {
    // Store original document.querySelectorAll
    const originalQuerySelectorAll = document.querySelectorAll;

    beforeEach(() => {
        // Mock document.querySelectorAll
        document.querySelectorAll = mockQuerySelectorAll;

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original methods
        document.querySelectorAll = originalQuerySelectorAll;
    });

    it("should remove only highlighted variant field classes when onlyHighlighted=true", () => {
        removeVariantFieldClass(true);

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith(
            `.${visualBuilderStyles()["visual-builder__variant-field-outline"]}`
        );

        // Verify classes were removed
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                visualBuilderStyles()["visual-builder__variant-field-outline"]
            );
        });
    });

    it("should remove all variant field classes when onlyHighlighted=false", () => {
        removeVariantFieldClass(false);

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith(
            ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field, .visual-builder__lower-order-variant-field"
        );

        // Verify classes were removed
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                "visual-builder__disabled-variant-field",
                "visual-builder__variant-field",
                visualBuilderStyles()["visual-builder__variant-field-outline"],
                "visual-builder__base-field",
                "visual-builder__lower-order-variant-field"
            );
        });
    });

    it("should default to onlyHighlighted=false when parameter not provided", () => {
        removeVariantFieldClass();

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith(
            ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field, .visual-builder__lower-order-variant-field"
        );
    });
});

describe("State Management Functions", () => {
    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Reset global state
        VisualBuilder.VisualBuilderGlobalState.value.audienceMode = false;
        VisualBuilder.VisualBuilderGlobalState.value.variant = null;
        VisualBuilder.VisualBuilderGlobalState.value.locale = "en-us";
        VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields = false;
    });

    it("setAudienceMode should update global state", () => {
        setAudienceMode(true);
        expect(VisualBuilder.VisualBuilderGlobalState.value.audienceMode).toBe(
            true
        );

        setAudienceMode(false);
        expect(VisualBuilder.VisualBuilderGlobalState.value.audienceMode).toBe(
            false
        );
    });

    it("setVariant should update global state", () => {
        setVariant("test-variant");
        expect(VisualBuilder.VisualBuilderGlobalState.value.variant).toBe(
            "test-variant"
        );

        setVariant(null);
        expect(VisualBuilder.VisualBuilderGlobalState.value.variant).toBe(null);
    });

    it("setLocale should update global state", () => {
        setLocale("fr-fr");
        expect(VisualBuilder.VisualBuilderGlobalState.value.locale).toBe(
            "fr-fr"
        );

        setLocale("en-us");
        expect(VisualBuilder.VisualBuilderGlobalState.value.locale).toBe(
            "en-us"
        );
    });

    it("setHighlightVariantFields should update global state", () => {
        setHighlightVariantFields(true);
        expect(VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields).toBe(
            true
        );

        setHighlightVariantFields(false);
        expect(VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields).toBe(
            false
        );
    });
});

describe("getHighlightVariantFieldsStatus", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return highlight status when successful", async () => {
        const mockResponse = { highlightVariantFields: true };
        (mockVisualBuilderPostMessage.send as any).mockResolvedValue(mockResponse);

        const result = await getHighlightVariantFieldsStatus();

        expect(mockVisualBuilderPostMessage.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_HIGHLIGHT_VARIANT_FIELDS_STATUS
        );
        expect(result).toEqual(mockResponse);
    });

    it("should return default false when response is null", async () => {
        (mockVisualBuilderPostMessage.send as any).mockResolvedValue(null);

        const result = await getHighlightVariantFieldsStatus();

        expect(result).toEqual({ highlightVariantFields: false });
    });

    it("should return default false when request fails", async () => {
        (mockVisualBuilderPostMessage.send as any).mockRejectedValue(
            new Error("Network error")
        );

        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const result = await getHighlightVariantFieldsStatus();

        expect(result).toEqual({ highlightVariantFields: false });
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to get highlight variant fields status:",
            expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
    });
});

describe("debounceAddVariantFieldClass", () => {
    const originalQuerySelectorAll = document.querySelectorAll;

    beforeEach(() => {
        document.querySelectorAll = mockQuerySelectorAll;
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        document.querySelectorAll = originalQuerySelectorAll;
        vi.useRealTimers();
    });

    it("should debounce addVariantFieldClass calls", () => {
        const variantUid = "variant-123";
        VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields = true;

        // Call multiple times rapidly
        debounceAddVariantFieldClass(variantUid);
        debounceAddVariantFieldClass(variantUid);
        debounceAddVariantFieldClass(variantUid);

        // Should not have been called yet (debounced)
        expect(mockQuerySelectorAll).not.toHaveBeenCalled();

        // Fast-forward time
        vi.advanceTimersByTime(1000);

        // Should have been called once (debounced)
        expect(mockQuerySelectorAll).toHaveBeenCalledTimes(1);
        expect(mockQuerySelectorAll).toHaveBeenCalledWith("[data-cslp]");
    });
});

describe("useVariantFieldsPostMessageEvent SSR handling", () => {
    const originalQuerySelectorAll = document.querySelectorAll;

    beforeEach(() => {
        document.querySelectorAll = mockQuerySelectorAll;
        vi.clearAllMocks();
    });

    afterEach(() => {
        document.querySelectorAll = originalQuerySelectorAll;
    });

    it("should call addVariantFieldClass directly when isSSR is true and variant is provided", () => {
        useVariantFieldsPostMessageEvent({ isSSR: true });

        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.GET_VARIANT_ID
        );
        const handler = call ? call[1] : null;

        vi.clearAllMocks();
        handler!({ data: { variant: "variant-123" } });

        // Should call addVariantFieldClass directly (not updateVariantClasses)
        expect(mockQuerySelectorAll).toHaveBeenCalledWith("[data-cslp]");
        expect(updateVariantClasses).not.toHaveBeenCalled();
    });

    it("should call updateVariantClasses when isSSR is false", () => {
        useVariantFieldsPostMessageEvent({ isSSR: false });

        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.GET_VARIANT_ID
        );
        const handler = call ? call[1] : null;

        vi.clearAllMocks();
        handler!({ data: { variant: "variant-123" } });

        // Should call updateVariantClasses (not addVariantFieldClass directly)
        expect(updateVariantClasses).toHaveBeenCalled();
        expect(mockQuerySelectorAll).not.toHaveBeenCalled();
    });

    it("should not call addVariantFieldClass when isSSR is true but variant is null", () => {
        useVariantFieldsPostMessageEvent({ isSSR: true });

        const call = mockVisualBuilderPostMessage.on.mock.calls.find(
            (call: any[]) =>
                call[0] === VisualBuilderPostMessageEvents.GET_VARIANT_ID
        );
        const handler = call ? call[1] : null;

        vi.clearAllMocks();
        handler!({ data: { variant: null } });

        // Should not call addVariantFieldClass when variant is null
        expect(mockQuerySelectorAll).not.toHaveBeenCalled();
        expect(updateVariantClasses).not.toHaveBeenCalled();
    });
});
