import { cloneDeep } from 'lodash-es';
import { sortObject } from './sort-object';

const tests: SortObjectTest<any>[] = [
    {
        object: { c: 3, b: 2, a: 1 },
        compareFn: ([keyA, valueA], [keyB, valueB]) => valueA - valueB,
        expectedObject: { a: 1, b: 2, c: 3 },
    },
    {
        object: { a: 1, b: 2, c: 3 },
        compareFn: ([keyA, valueA], [keyB, valueB]) => valueA - valueB,
        expectedObject: { a: 1, b: 2, c: 3 },
    },
    {
        object: { c: 3, b: 2, a: 1 },
        compareFn: ([keyA, valueA], [keyB, valueB]) => valueB - valueA,
        expectedObject: { c: 3, b: 2, a: 1 },
    },
    {
        object: { c: 3, b: 2, a: 1 },
        compareFn: ([keyA, valueA], [keyB, valueB]) =>
            (keyA as string).localeCompare(keyB as string),
        expectedObject: { a: 1, b: 2, c: 3 },
    },
];

describe('sortObject', () => {
    it.each(tests)('$# sorts %j', ({ object, compareFn, expectedObject }) => {
        const objectToBeSorted = cloneDeep(object);
        const sortedObj = sortObject(objectToBeSorted, compareFn);
        // The sorted object should be equal to the expected object
        expect(JSON.stringify(sortedObj)).toBe(JSON.stringify(expectedObject));
        expect(Object.keys(sortedObj)).toStrictEqual(
            Object.keys(expectedObject)
        );
        expect(Object.values(sortedObj)).toStrictEqual(
            Object.values(expectedObject)
        );
        // The original object should not be mutated
        expect(JSON.stringify(objectToBeSorted)).toBe(JSON.stringify(object));
        expect(Object.keys(objectToBeSorted)).toStrictEqual(
            Object.keys(object)
        );
        expect(Object.values(objectToBeSorted)).toStrictEqual(
            Object.values(object)
        );
    });
});

interface SortObjectTest<T extends { [key: string]: any }> {
    object: T;
    compareFn: (a: [keyof T, T[keyof T]], b: [keyof T, T[keyof T]]) => number;
    expectedObject: T;
}
