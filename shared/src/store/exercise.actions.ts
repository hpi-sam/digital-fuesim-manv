import { createAction, props } from '@ngrx/store';
import { Viewport, UUID } from '..';

export type ExerciseAction = ReturnType<
    typeof exerciseActionCreators[keyof typeof exerciseActionCreators]
>;

export const exerciseActionCreators = {
    // These actions are used to update the store in the frontend and are send to the backend to apply the changes there too.
    addViewport: createAction(
        '[Viewport] Add viewport',
        props<{ viewport: Viewport }>()
    ),
    removeViewport: createAction(
        '[Viewport] Remove viewport',
        props<{ viewportId: UUID }>()
    ),
};
