import { Action } from '@ngrx/store';
import { Viewport, UUID } from '..';

/**
 *  These actions are POJOS used to update the store in the frontend and are send to the backend to apply the changes there too.
 */
export namespace ExerciseActions {
    export class AddViewport implements Action {
        readonly type = '[Viewport] Add viewport';

        // TODO: it would be better code to provide an object like { viewport: Viewport } instead of constructor arguments
        // See https://github.com/microsoft/TypeScript/issues/5326
        constructor(public viewport: Viewport) {}
    }

    export class RemoveViewport implements Action {
        readonly type = '[Viewport] Remove viewport';

        constructor(public viewportId: UUID) {}
    }
}

export type ExerciseAction = InstanceType<
    typeof ExerciseActions[keyof typeof ExerciseActions]
>;
