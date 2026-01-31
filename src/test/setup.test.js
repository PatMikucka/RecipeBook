import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
    it('should work', () => {
        expect(1 + 1).toBe(2)
    });

    it('should have jest-dom matchers', () => {
        const element = document.createElement('div');
        element.textContent = 'Hello';
        expect(element).toHaveTextContent('Hello');
    });
});
