import { hasAPropertyChanged } from './has-a-property-changed';

describe('HasAPropertyChanged', () => {
    beforeEach(() => {});

    it('should recognize if a property is different between the elements', () => {
        expect(hasAPropertyChanged({ a: 0, b: 0 }, { a: 0, b: 1 }, [])).toBe(
            true
        );
        expect(hasAPropertyChanged({ a: 0, b: 1 }, { a: 0, b: 1 }, [])).toBe(
            false
        );
        expect(hasAPropertyChanged({ a: 1, b: 1 }, { a: 1, b: 1 }, [])).toBe(
            false
        );
    });

    it('should not make deep comparisons', () => {
        const oldElement = { a: { a: 1 }, b: 0 };
        const newElement = { a: { a: 1 }, b: 0 };
        expect(hasAPropertyChanged(oldElement, newElement, [])).toBe(true);
        const anObject = { a: 1 };
        expect(
            hasAPropertyChanged(
                { a: anObject, b: 0 },
                { a: anObject, b: 0 },
                []
            )
        ).toBe(false);
    });

    it('should respect ignored properties', () => {
        expect(hasAPropertyChanged({ a: 0, b: 0 }, { a: 0, b: 1 }, ['b'])).toBe(
            false
        );
        expect(hasAPropertyChanged({ a: 0, b: 1 }, { a: 1, b: 1 }, ['b'])).toBe(
            true
        );
    });

    it('should correctly handle optional properties', () => {
        expect(hasAPropertyChanged({ a: 0 }, { a: 0, b: 1 }, [])).toBe(true);
        expect(hasAPropertyChanged({ a: 0 }, { a: 0, b: 1 }, ['b'])).toBe(
            false
        );
        expect(hasAPropertyChanged<{ b?: number }>({}, {}, ['b'])).toBe(false);
    });
});
