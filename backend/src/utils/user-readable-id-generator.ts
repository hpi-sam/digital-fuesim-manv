export class UserReadableIdGenerator {
    private static generatedIds = new Set<string>();

    private static createExerciseId(): number {
        return Math.floor(Math.random() * 100_000);
    }

    public static generateId(): string {
        let newId: string | undefined = undefined;
        do {
            newId = this.createExerciseId().toString();
            if (UserReadableIdGenerator.generatedIds.has(newId)) {
                newId = undefined;
            }
        } while (newId === undefined);
        this.generatedIds.add(newId);
        return newId;
    }
}
