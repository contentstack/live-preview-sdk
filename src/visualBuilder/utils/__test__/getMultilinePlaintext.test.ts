import { describe, it, expect } from 'vitest';
import { getMultilinePlaintext } from '../getMultilinePlaintext';

describe('getMultilinePlaintext', () => {
    it('should return empty string for an element with no children', () => {
        const element = document.createElement('div');
        const result = getMultilinePlaintext(element);
        expect(result).toBe('');
    });

    it('should handle single line text', () => {
        const element = document.createElement('div');
        element.textContent = 'Hello, world!';
        const result = getMultilinePlaintext(element);
        expect(result).toBe('Hello, world!');
    });

    it('should handle multiple lines with <br> tags', () => {
        const element = document.createElement('div');
        element.innerHTML = 'Hello,<br>world!';
        const result = getMultilinePlaintext(element);
        expect(result).toBe('Hello,\nworld!');
    });

    it('should handle nested elements with text', () => {
        const element = document.createElement('div');
        element.innerHTML = '<div>Hello,</div><div>world!</div>';
        const result = getMultilinePlaintext(element);
        expect(result).toBe('Hello,\nworld!');
    });

    it('should handle mixed content with text and <br> tags', () => {
        const element = document.createElement('div');
        element.innerHTML = 'Hello,<br><div>world!</div>';
        const result = getMultilinePlaintext(element);
        expect(result).toBe('Hello,\nworld!');
    });
});