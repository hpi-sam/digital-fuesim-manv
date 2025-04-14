import { pushAll, removeAll } from './array.js';

describe('Array utility functions', () => {
    describe('pushAll', () => {
        it('adds all elements', () => {
            const array = [1, 2, 3];
            pushAll(array, [4, 5, 6]);
            expect(array).toStrictEqual([1, 2, 3, 4, 5, 6]);
        });
    });

    describe('removeAll', () => {
        it('removes all elements', () => {
            const array = [1, 2, 3];
            removeAll(array);
            expect(array).toStrictEqual([]);
        });
    });
});
