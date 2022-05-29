export class IncrementIdGenerator {
    private current = 0;

    public next() {
        if (this.current > Number.MAX_SAFE_INTEGER) {
            throw new RangeError(
                'The numbers exceeded the safe integer range.'
            );
        }
        return this.current++;
    }
}
