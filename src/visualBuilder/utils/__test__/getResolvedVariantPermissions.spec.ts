import { describe, it, expect, vi, beforeEach, afterEach, MockedObject } from 'vitest';
import { EventManager } from "@contentstack/advanced-post-message";
import { getResolvedVariantPermissions, FieldContext, ResolvedVariantPermissions } from '../getResolvedVariantPermissions';
import { VisualBuilderPostMessageEvents } from '../types/postMessage.types';
import visualBuilderPostMessage from '../visualBuilderPostMessage';

// Mock the visualBuilderPostMessage module
vi.mock('../visualBuilderPostMessage', () => {
    return {
        default: {
            send: vi.fn(),
        },
    };
});

const mockVisualBuilderPostMessage = visualBuilderPostMessage as MockedObject<EventManager>;

describe('getResolvedVariantPermissions', () => {
    const mockFieldContext: FieldContext = {
        content_type_uid: 'content_type_123',
        entry_uid: 'entry_456',
        locale: 'en-us',
        variant: 'variant_789',
        fieldPathWithIndex: 'title',
    };

    const mockSuccessResponse: ResolvedVariantPermissions = {
        update: true,
        error: false,
    };

    const mockErrorResponse: ResolvedVariantPermissions = {
        update: false,
        error: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock console.warn to avoid noise in test output
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Success scenarios', () => {
        it('should return resolved permissions when postMessage returns valid response', async () => {
            
            mockVisualBuilderPostMessage.send.mockResolvedValue(mockSuccessResponse);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(mockVisualBuilderPostMessage.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.GET_RESOLVED_VARIANT_PERMISSIONS,
                mockFieldContext
            );
            expect(result).toEqual(mockSuccessResponse);
        });

        it('should return resolved permissions with update: false when postMessage returns false', async () => {
            
            const responseWithUpdateFalse = { update: false, error: false };
            mockVisualBuilderPostMessage.send.mockResolvedValue(responseWithUpdateFalse);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(result).toEqual(responseWithUpdateFalse);
        });

        it('should handle response with only update property', async () => {
            
            const responseWithOnlyUpdate = { update: true };
            mockVisualBuilderPostMessage.send.mockResolvedValue(responseWithOnlyUpdate);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(result).toEqual(responseWithOnlyUpdate);
        });
    });

    describe('Null/undefined response handling', () => {
        it('should return default error response when postMessage returns null', async () => {
            
            mockVisualBuilderPostMessage.send.mockResolvedValue(null);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(result).toEqual({
                update: true,
                error: true,
            });
        });

        it('should return default error response when postMessage returns undefined', async () => {
            
            mockVisualBuilderPostMessage.send.mockResolvedValue(undefined);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(result).toEqual({
                update: true,
                error: true,
            });
        });
    });

    describe('Error handling', () => {
        it('should return default error response and log warning when postMessage throws error', async () => {
            
            const mockError = new Error('Network error');
            mockVisualBuilderPostMessage.send.mockRejectedValue(mockError);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(console.warn).toHaveBeenCalledWith(
                'Error retrieving resolved variant permissions',
                mockError
            );
            expect(result).toEqual({
                update: true,
                error: true,
            });
        });

        it('should handle different types of errors', async () => {
            
            const mockError = 'String error';
            mockVisualBuilderPostMessage.send.mockRejectedValue(mockError);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(console.warn).toHaveBeenCalledWith(
                'Error retrieving resolved variant permissions',
                mockError
            );
            expect(result).toEqual({
                update: true,
                error: true,
            });
        });

        it('should handle promise rejection without error object', async () => {
            
            mockVisualBuilderPostMessage.send.mockRejectedValue(null);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(console.warn).toHaveBeenCalledWith(
                'Error retrieving resolved variant permissions',
                null
            );
            expect(result).toEqual({
                update: true,
                error: true,
            });
        });
    });

    describe('Edge cases', () => {
        it('should handle empty field context object', async () => {
            
            const emptyFieldContext = {} as FieldContext;
            mockVisualBuilderPostMessage.send.mockResolvedValue(mockSuccessResponse);

            
            const result = await getResolvedVariantPermissions(emptyFieldContext);

            
            expect(mockVisualBuilderPostMessage.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.GET_RESOLVED_VARIANT_PERMISSIONS,
                emptyFieldContext
            );
            expect(result).toEqual(mockSuccessResponse);
        });

        it('should handle field context with undefined variant', async () => {
            
            const fieldContextWithUndefinedVariant: FieldContext = {
                ...mockFieldContext,
                variant: undefined,
            };
            mockVisualBuilderPostMessage.send.mockResolvedValue(mockSuccessResponse);

            
            const result = await getResolvedVariantPermissions(fieldContextWithUndefinedVariant);

            
            expect(mockVisualBuilderPostMessage.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.GET_RESOLVED_VARIANT_PERMISSIONS,
                fieldContextWithUndefinedVariant
            );
            expect(result).toEqual(mockSuccessResponse);
        });

        it('should handle field context with null variant', async () => {
            
            const fieldContextWithNullVariant: FieldContext = {
                ...mockFieldContext,
                variant: null as any,
            };
            mockVisualBuilderPostMessage.send.mockResolvedValue(mockSuccessResponse);

            
            const result = await getResolvedVariantPermissions(fieldContextWithNullVariant);

            
            expect(mockVisualBuilderPostMessage.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.GET_RESOLVED_VARIANT_PERMISSIONS,
                fieldContextWithNullVariant
            );
            expect(result).toEqual(mockSuccessResponse);
        });
    });

    describe('Type safety', () => {
        it('should maintain proper typing for ResolvedVariantPermissions interface', async () => {
            
            const response: ResolvedVariantPermissions = {
                update: true,
                error: false,
            };
            mockVisualBuilderPostMessage.send.mockResolvedValue(response);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(typeof result.update).toBe('boolean');
            expect(typeof result.error).toBe('boolean');
            expect(result).toHaveProperty('update');
            expect(result).toHaveProperty('error');
        });

        it('should handle response with additional properties', async () => {
            
            const responseWithExtraProps = {
                update: true,
                error: false,
                extraProperty: 'should be ignored',
            };
            mockVisualBuilderPostMessage.send.mockResolvedValue(responseWithExtraProps);

            
            const result = await getResolvedVariantPermissions(mockFieldContext);

            
            expect(result).toEqual(responseWithExtraProps);
        });
    });
});
