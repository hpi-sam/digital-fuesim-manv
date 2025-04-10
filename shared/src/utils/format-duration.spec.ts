import { formatDuration } from './format-duration.js';

describe('formatDuration', () => {
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;

    it('formats durations less than a second correctly', () => {
        expect(formatDuration(0)).toEqual(`00:00:00`);
        expect(formatDuration(200)).toEqual(`00:00:00`);
        expect(formatDuration(600)).toEqual(`00:00:00`);
    });

    it('formats durations less than a day correctly', () => {
        expect(formatDuration(0 * hour + 2 * minute + 42 * second)).toEqual(
            `00:02:42`
        );
        expect(formatDuration(1 * hour + 1 * minute + 1 * second)).toEqual(
            `01:01:01`
        );
        expect(formatDuration(10 * hour + 30 * minute + 10 * second)).toEqual(
            `10:30:10`
        );
    });

    it('formats durations with days correctly', () => {
        expect(
            formatDuration(1 * day + 0 * hour + 0 * minute + 0 * second)
        ).toEqual(`1\u2009d 00:00:00`);
        expect(
            formatDuration(365 * day + 0 * hour + 0 * minute + 0 * second)
        ).toEqual(`365\u2009d 00:00:00`);
        expect(
            formatDuration(365 * day + 3 * hour + 12 * minute + 1 * second)
        ).toEqual(`365\u2009d 03:12:01`);
    });
});
