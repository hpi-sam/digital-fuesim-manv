import type { ExerciseState, UUID, Viewport } from '..';
import { uuid, generateExercise } from '..';
import { exerciseReducer } from '.';

describe('exerciseReducer', () => {
    let state: ExerciseState;

    function generateViewport() {
        return {
            id: uuid(),
            name: 'Test',
            size: { width: 100, height: 100 },
            topLeft: { x: 0, y: 0 },
        } as const;
    }

    function addViewport(viewport: Viewport) {
        state = exerciseReducer(state, {
            type: '[Viewport] Add viewport',
            viewport,
        });
    }

    function removeViewport(viewportId: UUID) {
        state = exerciseReducer(state, {
            type: '[Viewport] Remove viewport',
            viewportId,
        });
    }

    beforeEach(() => {
        state = generateExercise();
    });

    it('should apply simple actions', () => {
        const viewports = [generateViewport(), generateViewport()];
        addViewport(viewports[0]);
        expect(state.viewports[viewports[0].id]).toEqual(viewports[0]);
        addViewport(viewports[1]);
        expect(state.viewports[viewports[1].id]).toEqual(viewports[1]);
        removeViewport(viewports[0].id);
        expect(state.viewports[viewports[0].id]).toBeUndefined();
    });

    it('should throw an error if an action is unsuccessful', () => {
        expect(() => removeViewport(uuid())).toThrow();
    });
});
