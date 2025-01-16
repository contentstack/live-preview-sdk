import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import getChildElements from '../getChildElements';

describe('getChildElements', () => {
    let parentElement: HTMLElement;

    beforeEach(() => {
        parentElement = document.createElement('div');
    });

    afterEach(() => {
        parentElement.innerHTML = '';
    });

    it('should return null, null, and a no-op function if no children match', () => {
        const [firstChild, secondChild, removeClone] = getChildElements(parentElement, 'test');
        expect(firstChild).toBeNull();
        expect(secondChild).toBeNull();
        expect(removeClone).toBeInstanceOf(Function);
    });

    it('should return the first and second child elements if they exist', () => {
        const child1 = document.createElement('div');
        child1.setAttribute('data-cslp', 'test.1');
        const child2 = document.createElement('div');
        child2.setAttribute('data-cslp', 'test.2');
        parentElement.appendChild(child1);
        parentElement.appendChild(child2);

        const [firstChild, secondChild, removeClone] = getChildElements(parentElement, 'test');
        expect(firstChild).toBe(child1);
        expect(secondChild).toBe(child2);
        expect(removeClone).toBeInstanceOf(Function);
    });

    it('should return the first child and a clone if only one child matches', () => {
        const child1 = document.createElement('div');
        child1.classList.add('test-class');
        child1.setAttribute('data-cslp', 'test.1');
        parentElement.appendChild(child1);

        const [firstChild, secondChild, removeClone] = getChildElements(parentElement, 'test');
        expect(firstChild).toBe(child1);
        expect(secondChild).not.toBeNull();
        expect(secondChild?.tagName).toBe(child1.tagName);
        expect(secondChild?.getAttribute('class')).toBe(child1.getAttribute('class'));
        expect(secondChild?.getAttribute('style')).toContain('overflow: hidden');
        expect(removeClone).toBeInstanceOf(Function);

        removeClone();
        expect(parentElement.contains(secondChild!)).toBe(false);
    });

    it('should filter out elements that do not end with ".number"', () => {
        const child1 = document.createElement('div');
        child1.setAttribute('data-cslp', 'test.1');
        const invalidChild = document.createElement('div');
        invalidChild.setAttribute('data-cslp', 'test.invalid');
        const child2 = document.createElement('div');
        child2.setAttribute('data-cslp', 'test.2');
        parentElement.appendChild(child1);
        parentElement.appendChild(child2);

        const [firstChild, secondChild, removeClone] = getChildElements(parentElement, 'test');
        expect(firstChild).toBe(child1);
        expect(secondChild).toBe(child2);
        expect(removeClone).toBeInstanceOf(Function);
    });
});