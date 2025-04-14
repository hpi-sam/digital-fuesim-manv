import { arrayToUUIDSet } from './array-to-uuid-set.js';

describe('array to uuid set', () => {
    it('properly converts an array', () => {
        const input = [
            'dc1693a8-d4ba-4929-87f3-b7ffe7f364aa',
            '859cdc18-d42a-4198-92aa-bda5e86bcbd6',
            '8f3e21d1-2ea0-4abe-af31-34095786e269',
        ];
        const result = arrayToUUIDSet(input);
        expect(result).toStrictEqual({
            'dc1693a8-d4ba-4929-87f3-b7ffe7f364aa': true,
            '859cdc18-d42a-4198-92aa-bda5e86bcbd6': true,
            '8f3e21d1-2ea0-4abe-af31-34095786e269': true,
        });
    });
});
