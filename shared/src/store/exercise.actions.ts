import { createAction, props } from '@ngrx/store';
import { Viewport, UUID } from '..';

// These actions are used to update the store in the frontend and are send to the backend to apply the changes there too.
export const addViewport = createAction(
    '[Viewport] Add viewport',
    props<{ viewport: Viewport }>()
);

export const removeViewport = createAction(
    '[Viewport] Remove viewport',
    props<{ viewportId: UUID }>()
);
