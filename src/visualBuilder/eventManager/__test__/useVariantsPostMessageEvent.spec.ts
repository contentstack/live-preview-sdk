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
} from "../../../visualBuilder/eventManager/useVariantsPostMessageEvent";
import { VisualBuilderPostMessageEvents } from "../../../visualBuilder/utils/types/postMessage.types";
import { VisualBuilder } from "../../../visualBuilder";
import { FieldSchemaMap } from "../../../visualBuilder/utils/fieldSchemaMap";
import { visualBuilderStyles } from "../../../visualBuilder/visualBuilder.style";
import visualBuilderPostMessage from "../../../visualBuilder/utils/visualBuilderPostMessage";
import { EventManager } from "@contentstack/advanced-post-message";

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

vi.mock("../../../visualBuilder", () => {
    return {
        VisualBuilder: {
            VisualBuilderGlobalState: {
                value: {
                    audienceMode: false,
                    variant: null,
                    locale: "en-us",
                },
            },
        },
    };
});

// Create a more realistic mock of the CSS modules
const cssClassMock = "go109692693"; // Match the actual generated class name

vi.mock("../../../visualBuilder.style", () => {
    return {
        visualBuilderStyles: () => ({
            "visual-builder__variant-field": cssClassMock,
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
    } else if (selector === `.${cssClassMock}`) {
        return mockElements; // For onlyHighlighted=true case
    } else if (
        selector ===
        ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field"
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
        useVariantFieldsPostMessageEvent();

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
        useVariantFieldsPostMessageEvent();

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
        useVariantFieldsPostMessageEvent();

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
        useVariantFieldsPostMessageEvent();

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
        useVariantFieldsPostMessageEvent();

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
            visualBuilderStyles()["visual-builder__variant-field"]
        );
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            "visual-builder__variant-field"
        );
    });

    it("should handle REMOVE_VARIANT_FIELDS event with onlyHighlighted=true", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent();

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
            `.${visualBuilderStyles()["visual-builder__variant-field"]}`
        );

        // Verify that classes were removed from elements correctly
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                visualBuilderStyles()["visual-builder__variant-field"]
            );
        });
    });

    it("should handle REMOVE_VARIANT_FIELDS event with onlyHighlighted=false", () => {
        // Register event handlers
        useVariantFieldsPostMessageEvent();

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
            ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field"
        );

        // Verify that classes were removed from elements correctly
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                "visual-builder__disabled-variant-field",
                "visual-builder__variant-field",
                visualBuilderStyles()["visual-builder__variant-field"],
                "visual-builder__base-field"
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
        const highlightVariantFields = true;

        addVariantFieldClass(variantUid, highlightVariantFields);

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith("[data-cslp]");

        // First element has the variant ID
        expect(mockElements[0].getAttribute).toHaveBeenCalledWith("data-cslp");
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            visualBuilderStyles()["visual-builder__variant-field"]
        );
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            "visual-builder__variant-field"
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
        const highlightVariantFields = false;

        addVariantFieldClass(variantUid, highlightVariantFields);

        // First element has the variant ID but should not get highlight class
        expect(mockElements[0].getAttribute).toHaveBeenCalledWith("data-cslp");
        expect(mockElements[0].classList.add).not.toHaveBeenCalledWith(
            visualBuilderStyles()["visual-builder__variant-field"]
        );
        expect(mockElements[0].classList.add).toHaveBeenCalledWith(
            "visual-builder__variant-field"
        );
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
            `.${visualBuilderStyles()["visual-builder__variant-field"]}`
        );

        // Verify classes were removed
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                visualBuilderStyles()["visual-builder__variant-field"]
            );
        });
    });

    it("should remove all variant field classes when onlyHighlighted=false", () => {
        removeVariantFieldClass(false);

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith(
            ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field"
        );

        // Verify classes were removed
        mockElements.forEach((element) => {
            expect(element.classList.remove).toHaveBeenCalledWith(
                "visual-builder__disabled-variant-field",
                "visual-builder__variant-field",
                visualBuilderStyles()["visual-builder__variant-field"],
                "visual-builder__base-field"
            );
        });
    });

    it("should default to onlyHighlighted=false when parameter not provided", () => {
        removeVariantFieldClass();

        // Verify querySelectorAll was called with the correct selector
        expect(mockQuerySelectorAll).toHaveBeenCalledWith(
            ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field"
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
});
