import { calculatePopupPositioning } from './calculate-popup-positioning';

describe('CalculatePopupPositioning', () => {
    // beforeAll(() => {
    //     //coordinate origin is bottom-left
    //     const viewCenter = [2,2];
    //     const constraints = {width: 1, height: 1};
    // });
    it('popup should be at top, if feature is in bottom half', () => {
        const viewCenter = [2, 2];
        const constraints = { width: 1, height: 1 };

        expect(
            calculatePopupPositioning([1, 1], constraints, viewCenter)
                .positioning
        ).toEqual('bottom-center');

        expect(
            calculatePopupPositioning([3, 1], constraints, viewCenter)
                .positioning
        ).toEqual('bottom-center');
    });

    it('popup should be at bottom, if feature is in top half and not close to the sides', () => {
        const viewCenter = [2, 2];
        const constraints = { width: 1, height: 1 };

        expect(
            calculatePopupPositioning([1.5, 3], constraints, viewCenter)
                .positioning
        ).toEqual('top-center');

        expect(
            calculatePopupPositioning([2.5, 3], constraints, viewCenter)
                .positioning
        ).toEqual('top-center');
    });

    it('popup should be at left or right, if feature is in top half and close to the sides', () => {
        const viewCenter = [2, 2];
        const constraints = { width: 1, height: 1 };

        expect(
            calculatePopupPositioning([0.5, 3], constraints, viewCenter)
                .positioning
        ).toEqual('center-left');

        expect(
            calculatePopupPositioning([3.5, 3], constraints, viewCenter)
                .positioning
        ).toEqual('center-right');
    });

    it('should apply constraints to position', () => {
        const viewCenter = [2, 2];
        const constraints = { width: 1, height: 1 };

        expect(
            calculatePopupPositioning([1, 1], constraints, viewCenter).position
        ).toEqual([1, 1.5]);

        expect(
            calculatePopupPositioning([4, 3], constraints, viewCenter).position
        ).toEqual([3.5, 3]);
    });
});
