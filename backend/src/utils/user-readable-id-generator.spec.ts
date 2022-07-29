import { UserReadableIdGenerator } from './user-readable-id-generator';

describe('user-readable-id-generator', () => {
    let generatedIds = new Array<string>();
    beforeEach(() => {
        UserReadableIdGenerator.freeAll();
        generatedIds = new Array<string>();
        for (let i = 0; i < 10_000; i++) {
            generatedIds.push(UserReadableIdGenerator.generateId());
        }
    });

    describe('valid ids', () => {
        it('should be in bounds', () => {
            generatedIds.forEach((id) => {
                const intId = Number.parseInt(id);
                expect(intId).toBeGreaterThanOrEqual(0);
                expect(intId).toBeLessThan(1_000_000);
            });
        });

        it('should not generate an already existing id', () => {
            const uniqueIds = new Set(generatedIds);
            expect(uniqueIds.size).toBe(generatedIds.length);
        });

        it('should return ids of a uniform size', () => {
            expect(generatedIds.every((id) => id.length === 6)).toBe(true);
        });
    });

    describe('bounds', () => {
        it('should fail when no id is left', () => {
            // We already have the maximum amount of ids in our collection
            expect(() => {
                UserReadableIdGenerator.generateId();
            }).toThrow(RangeError);
        });

        it('should allow another id after freeing', () => {
            UserReadableIdGenerator.freeId(generatedIds[0]!);
            expect(() => {
                UserReadableIdGenerator.generateId();
            }).not.toThrow(RangeError);
        });
    });

    describe('different length', () => {
        beforeEach(() => {
            UserReadableIdGenerator.freeId(generatedIds[0]!);
        });

        it('succeeds creating an id longer than 6', () => {
            expect(UserReadableIdGenerator.generateId(8).length).toBe(8);
            UserReadableIdGenerator.freeId(generatedIds[1]!);
            expect(UserReadableIdGenerator.generateId(50).length).toBe(50);
        });

        it('fails creating an id shorter than 6', () => {
            expect(() => {
                UserReadableIdGenerator.generateId(5);
            }).toThrow(RangeError);
        });

        it('succeeds freeing a longer id', () => {
            const id = UserReadableIdGenerator.generateId(8);

            // We now have the maximum amount of ids in our collection
            expect(() => {
                UserReadableIdGenerator.generateId();
            }).toThrow(RangeError);

            UserReadableIdGenerator.freeId(id);

            // After freeing there should be one available again.
            expect(() => {
                UserReadableIdGenerator.generateId();
            }).not.toThrow(RangeError);
        });
    });
});
