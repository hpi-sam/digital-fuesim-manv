import { UserReadableIdGenerator } from "./user-readable-id-generator"

describe('user-readable-id-generator', () => {
    const generatedIds = new Array<string>();
    beforeEach(() => {
        for(let i=0; i<1000; i++){
            generatedIds.push(UserReadableIdGenerator.generateId());
        }
    });

    it('should be in bounds', () => {
        generatedIds.forEach((id) => {
            const intId = parseInt(id, 10)
            expect(intId > 0);
            expect(intId < 100000);
        })
    });

    it('should not generate an already existing id', () => {
        for (let id of generatedIds){

            generatedIds.forEach
        }
        generatedIds.forEach((currentId) => {
            let count = 0;
            generatedIds.forEach((id) => {
                if (currentId === id){
                    count++;
                }
            })
            expect(count === 1);
        })
    })
})
