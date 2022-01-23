export class UserReadableIdGenerator {
    private static readonly generatedIds = new Set<string>();

    private static createExerciseId(): number {
        return Math.floor(Math.random() * 1_000_000);
    }

    /**
     * Generates and blocks a new id
     * @returns A random integer string (decimal) in [0, 1_000_000)
     */
    public static generateId(): string {
        if (this.generatedIds.size >= 10_000) {
            throw new RangeError('Cannot generate more than 10000 ids.');
        }
        let newId: string | undefined;
        do {
            newId = this.createExerciseId().toString().padStart(6, '0');
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
}
