import type { Viewport } from '../models';
import { ExerciseState } from '../state';
import type { UUID } from '../utils';
import { uuid } from '../utils';
import { reduceExerciseState } from './reduce-exercise-state';
import { ReducerError } from './reducer-error';

describe('exerciseReducer', () => {
    let state: ExerciseState;

    function generateViewport(): Viewport {
        return {
            id: uuid(),
            name: 'Test',
            size: { width: 100, height: 100 },
            position: { x: 0, y: 0 },
        } as const;
    }

    function addViewport(viewport: Viewport) {
        state = reduceExerciseState(state, {
            type: '[Viewport] Add viewport',
            viewport,
        });
    }

    function removeViewport(viewportId: UUID) {
        state = reduceExerciseState(state, {
            type: '[Viewport] Remove viewport',
            viewportId,
        });
    }

    beforeEach(() => {
        state = ExerciseState.create();
    });

    it('should apply simple actions', () => {
        const viewports: [Viewport, Viewport] = [
            generateViewport(),
            generateViewport(),
        ];
        addViewport(viewports[0]);
        expect(state.viewports[viewports[0].id]).toEqual(viewports[0]);
        addViewport(viewports[1]);
        expect(state.viewports[viewports[1].id]).toEqual(viewports[1]);
        removeViewport(viewports[0].id);
        expect(state.viewports[viewports[0].id]).toBeUndefined();
    });

    it('should throw an error if an action is unsuccessful', () => {
        expect(() => removeViewport(uuid())).toThrow(ReducerError);
    });
});
