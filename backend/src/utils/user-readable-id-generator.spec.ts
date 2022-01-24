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
            UserReadableIdGenerator.freeId(generatedIds[0]);
            expect(() => {
                UserReadableIdGenerator.generateId();
            }).not.toThrow(RangeError);
        });
    });
});
