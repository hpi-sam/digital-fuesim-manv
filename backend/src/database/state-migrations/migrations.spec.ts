import { ExerciseState } from 'digital-fuesim-manv-shared';
import { range } from 'lodash-es';
import { migrations } from './migrations';

describe('migrations definition', () => {
    it('has the correct versions', () => {
        const expectKeys = range(2, ExerciseState.currentStateVersion + 1).map(
            (number) => number.toString()
        );
        expect(Object.keys(migrations)).toStrictEqual(expectKeys);
    });
});
