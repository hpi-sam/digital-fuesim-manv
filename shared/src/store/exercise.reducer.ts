import { on } from '@ngrx/store';
import { createImmerReducer } from 'ngrx-immer/store';
import { Exercise } from '..';
import { addViewport, removeViewport } from './exercise.actions';

/**
 * Reducer function that applies Actions on the provided state.
 * You can use it either in combination with the @ngrx/store or manually like this:
 *
 * ```typescript
 * const state = { ...new Exercise() };
 * const action = addViewport({ viewport: {} as any });
 * exerciseReducer(state, action);
 * // the state is now updated
 * ```
 */
// `createImmerReducer` is a helper function that applies [immers produce](https://immerjs.github.io/immer/produce/) during each `on` reducer
// this means that the state is immutable (which is required in the frontend). To make it mutable, you could use createReducer instead (performance benefit).
export const exerciseReducer = createImmerReducer(
    // TODO: else the following error is thrown:
    // `[Immer] produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'.Got '[object Object]'`
    // (I have no idea why...)
    { ...new Exercise() },
    on(addViewport, (state, { viewport }) => {
        console.log(addViewport({ viewport }));

        state.viewports.set(viewport.id, viewport);
        return state;
    }),
    on(removeViewport, (state, { viewportId }) => {
        state.viewports.delete(viewportId);
        return state;
    })
);
