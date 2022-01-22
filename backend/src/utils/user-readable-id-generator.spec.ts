import { UserReadableIdGenerator } from './user-readable-id-generator';

describe('user-readable-id-generator', () => {
    const generatedIds = new Array<string>();
    beforeAll(() => {
        for (let i = 0; i < 10_000; i++) {
            generatedIds.push(UserReadableIdGenerator.generateId());
        }
    });

    describe('valid ids', () => {
        it('should be in bounds', () => {
            generatedIds.forEach((id) => {
                const intId = parseInt(id);
                expect(intId).toBeGreaterThanOrEqual(0);
                expect(intId).toBeLessThan(1_000_000);
            });
        });

        it('should not generate an already existing id', () => {
            const uniqueIds = new Set(generatedIds);
            expect(uniqueIds.size).toBe(generatedIds.length);
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
