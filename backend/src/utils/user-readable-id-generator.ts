export class UserReadableIdGenerator {
    private static readonly generatedIds = new Set<string>();

    private static createRandomInteger(maximum: number): number {
        return Math.floor(Math.random() * maximum);
    }

    /**
     * Generates and blocks a new id
     * @param length The desired length of the output. Defaults to 6. Should be an integer. Must be at least 6.
     * @returns A random integer string (decimal) in [0, 10^{@link length})
     */
    public static generateId(length: number = 6): string {
        if (length < 6) {
            throw new RangeError('length must be at least 6.');
        }
        if (this.generatedIds.size >= 10_000) {
            throw new RangeError('Cannot generate more than 10000 ids.');
        }
        let newId: string | undefined;
        do {
            newId = this.createRandomInteger(10 ** length)
                .toString()
                .padStart(length, '0');
            if (UserReadableIdGenerator.generatedIds.has(newId)) {
                newId = undefined;
            }
        } while (newId === undefined);
        this.generatedIds.add(newId);
        return newId;
    }

    /**
     * Frees the allocation of an id
     * @param id The id to be removed from the list of blocked ids
     */
    public static freeId(id: string) {
        this.generatedIds.delete(id);
    }

    /**
     * Frees the allocation of every currently allocated id
     */
    public static freeAll() {
        this.generatedIds.clear();
    }

    /**
     * Notes all provided {@link ids} as used.
     * @param ids The ids to lock
     */
    public static lock(ids: string[]) {
        ids.map((id) => this.generatedIds.add(id));
    }
}
