import { describe, it, expect, vi } from 'vitest';
import { getDiscussionIdByFieldMetaData } from '../getDiscussionIdByFieldMetaData';
import visualBuilderPostMessage from '../visualBuilderPostMessage';
import { VisualBuilderPostMessageEvents } from '../types/postMessage.types';
import { hasPostMessageError } from '../errorHandling';
import { IActiveDiscussion } from '../../components/CommentIcon';

vi.mock('../visualBuilderPostMessage');
vi.mock('../errorHandling');

describe('getDiscussionIdByFieldMetaData', () => {
    const mockFieldMetadata = { /* mock field metadata */ } as any;
    const mockFieldSchema = { /* mock field schema */ } as any;

    it('should return discussion data when post message is successful', async () => {
        const mockDiscussion: IActiveDiscussion = { /* mock discussion data */ } as any;
        (visualBuilderPostMessage?.send as any).mockResolvedValue(mockDiscussion);
        (hasPostMessageError as any).mockReturnValue(false);

        const result = await getDiscussionIdByFieldMetaData({ fieldMetadata: mockFieldMetadata, fieldSchema: mockFieldSchema });

        expect(result).toEqual(mockDiscussion);
        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_DISCUSSION_ID,
            { fieldMetadata: mockFieldMetadata, fieldSchema: mockFieldSchema }
        );
    });

    it('should return null when post message returns an error', async () => {
        const mockDiscussion = null;
        (visualBuilderPostMessage?.send as any).mockResolvedValue(mockDiscussion);
        (hasPostMessageError as any).mockReturnValue(true);

        const result = await getDiscussionIdByFieldMetaData({ fieldMetadata: mockFieldMetadata, fieldSchema: mockFieldSchema });

        expect(result).toBeNull();
        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_DISCUSSION_ID,
            { fieldMetadata: mockFieldMetadata, fieldSchema: mockFieldSchema }
        );
    });

    it('should return null when post message is null', async () => {
        (visualBuilderPostMessage?.send as any).mockResolvedValue(null);
        (hasPostMessageError as any).mockReturnValue(false);

        const result = await getDiscussionIdByFieldMetaData({ fieldMetadata: mockFieldMetadata, fieldSchema: mockFieldSchema });

        expect(result).toBeNull();
        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_DISCUSSION_ID,
            { fieldMetadata: mockFieldMetadata, fieldSchema: mockFieldSchema }
        );
    });
});