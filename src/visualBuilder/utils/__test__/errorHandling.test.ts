import { hasPostMessageError } from '../errorHandling';

describe('hasPostMessageError', () => {
    it('should return true if obj.error is true', () => {
        const obj = { error: true };
        expect(hasPostMessageError(obj)).toBe(true);
    });

    it('should return false if obj.error is false', () => {
        const obj = { error: false };
        expect(hasPostMessageError(obj)).toBe(false);
    });

    it('should return false if obj.error is undefined', () => {
        const obj = {};
        expect(hasPostMessageError(obj)).toBe(false);
    });

    it('should return false if obj is null', () => {
        const obj = null;
        expect(hasPostMessageError(obj)).toBe(false);
    });

    it('should return false if obj is not an object', () => {
        const obj = 'not an object';
        expect(hasPostMessageError(obj)).toBe(false);
    });
});