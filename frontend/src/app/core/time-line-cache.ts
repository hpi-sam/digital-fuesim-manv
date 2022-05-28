export class TimeLineCache<T> {
    /**
     * Only save a value at most every {@link minTimeDifference} milliseconds
     */
    private static readonly minTimeDifference = 10 * 1000;
    /**
     * An array sorted after the time property of its elements
     * the smallest time is at the beginning of the array
     */
    private readonly sortedArray = new Array<{
        readonly time: number;
        readonly value: T;
    }>();

    public add(time: number, value: T) {
        if (
            // TODO: This could be made more efficient by leveraging the fact that the array is sorted - probably not worth it though
            this.sortedArray.some(
                ({ time: t }) =>
                    Math.abs(t - time) < TimeLineCache.minTimeDifference
            )
        ) {
            // We don't want to save this value
            return;
        }
        const index = this.getIndexNotAfter(time);
        if (index === undefined) {
            this.sortedArray.push({ time, value });
            return;
        }
        this.sortedArray.splice(index + 1, 0, {
            time,
            value,
        });
    }

    /**
     * @returns the nearest value with a time less or equal than the given time
     */
    public getNearestValueNotAfter(wantedTime: number): T | undefined {
        const index = this.getIndexNotAfter(wantedTime);
        if (index === undefined) {
            return undefined;
        }
        return this.sortedArray[index]?.value;
    }

    /**
     * @returns the index of the element nearest element to {@link wantedTime} that is not bigger than {@link wantedTime}
     * or undefined if there is no such element
     */
    private getIndexNotAfter(wantedTime: number): number | undefined {
        // TODO: This could be made more efficient by using binary search - probably not worth it though
        const firstBiggerElementIndex = this.sortedArray.findIndex(
            ({ time }) => time > wantedTime
        );
        if (this.sortedArray.length === 0) {
            return undefined;
        }
        if (firstBiggerElementIndex === -1) {
            if (this.sortedArray.at(-1)!.time <= wantedTime) {
                return this.sortedArray.length - 1;
            }
            // All elements are bigger than wantedTime
            return undefined;
        }
        return firstBiggerElementIndex - 1;
    }
}
