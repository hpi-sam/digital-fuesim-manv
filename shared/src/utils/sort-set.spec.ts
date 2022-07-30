import { sortSet } from './sort-set';

describe('sort set', () => {
    it('correctly sorts objects by key', () => {
        const object = {
            a: 'b',
            c: 'a',
            b: 'c',
        };
        const sorted = sortSet(
            object,
            false,
            (key) => key,
            (left, right) => left.localeCompare(right)
        );
        expect(sorted).toStrictEqual({
            a: 'b',
            b: 'c',
            c: 'a',
        });
    });

    it('correctly sorts objects by value', () => {
        const object = {
            a: 'b',
            c: 'a',
            b: 'c',
        };
        const sorted = sortSet(
            object,
            true,
            (value) => value,
            (left, right) => left.localeCompare(right)
        );
        expect(sorted).toStrictEqual({
            c: 'a',
            a: 'b',
            b: 'c',
        });
    });
});
