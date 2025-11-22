import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/preact";
import "@testing-library/jest-dom/vitest";

// IMPORTANT: vi.mock MUST be at top level - cannot be inside beforeAll or any function
vi.mock("./src/visualBuilder/utils/getEntryPermissionsCached", () => ({
    getEntryPermissionsCached: vi.fn().mockResolvedValue({
        read: true,
        publish: true,
        update: true,
        delete: true,
    }),
}));

vi.mock(
    "./src/visualBuilder/utils/fetchEntryPermissionsAndStageDetails",
    () => ({
        fetchEntryPermissionsAndStageDetails: vi.fn().mockResolvedValue({
            acl: {
                create: true,
                read: true,
                update: true,
                delete: true,
                publish: true,
            },
            workflowStage: {
                stage: undefined,
                permissions: {
                    entry: {
                        update: true,
                    },
                },
            },
            resolvedVariantPermissions: {
                update: true,
            },
        }),
    })
);

beforeAll(() => {
    // Vitest 4: Use class-based mocks for constructors
    global.ResizeObserver = class ResizeObserver {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(_callback: ResizeObserverCallback) {}
    } as any;

    global.MutationObserver = class MutationObserver {
        observe = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn(() => []);
        constructor(_callback: MutationCallback) {}
    } as any;

    document.elementFromPoint = vi.fn();
});

afterAll(() => {
    cleanup();
});

// const sideEffects = {
//     document: {
//         addEventListener: {
//             fn: document.addEventListener,
//             refs: [],
//         },
//         keys: Object.keys(document),
//     },
//     window: {
//         addEventListener: {
//             fn: window.addEventListener,
//             refs: [],
//         },
//         keys: Object.keys(window),
//     },
// };

// // Lifecycle Hooks
// // -----------------------------------------------------------------------------
// beforeAll(async () => {
//     // Spy addEventListener
//     ['document', 'window'].forEach(obj => {
//         const fn = sideEffects[obj].addEventListener.fn;
//         const refs = sideEffects[obj].addEventListener.refs;

//         function addEventListenerSpy(type, listener, options) {
//             // Store listener reference so it can be removed during reset
//             refs.push({ type, listener, options });
//             // Call original window.addEventListener
//             fn(type, listener, options);
//         }

//         // Add to default key array to prevent removal during reset
//         sideEffects[obj].keys.push('addEventListener');

//         // Replace addEventListener with mock
//         global[obj].addEventListener = addEventListenerSpy;
//     });
// });

// // Reset JSDOM. This attempts to remove side effects from tests, however it does
// // not reset all changes made to globals like the window and document
// // objects. Tests requiring a full JSDOM reset should be stored in separate
// // files, which is only way to do a complete JSDOM reset with Jest.
// afterAll(async () => {
//     const rootElm = document.documentElement;

//     // Remove global listeners and keys
//     ['document', 'window'].forEach(obj => {
//       const refs = sideEffects[obj].addEventListener.refs;

//       // Listeners
//       while (refs.length) {
//         const { type, listener, options } = refs.pop();
//         global[obj].removeEventListener(type, listener, options);
//       }
//     });

//     // Restore base elements
//     rootElm.innerHTML = '<head></head><body></body>';
// });
