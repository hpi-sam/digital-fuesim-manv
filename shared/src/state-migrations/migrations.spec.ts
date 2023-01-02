import { range } from 'lodash-es';
import { ExerciseState } from '../state';
import { migrations } from './migration-functions';

describe('migrations definition', () => {
    it('has the correct versions', () => {
        const expectKeys = range(2, ExerciseState.currentStateVersion + 1).map(
            (number) => number.toString()
        );
        expect(Object.keys(migrations)).toStrictEqual(expectKeys);
    });
});
