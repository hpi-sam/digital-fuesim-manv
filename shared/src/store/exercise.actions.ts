import { Viewport, UUID } from '..';

/**
 *  These actions are POJOS used to update the store in the frontend and are send to the backend to apply the changes there too.
 */
export namespace ExerciseActions {
    export class AddViewport implements Action {
        readonly type = '[Viewport] Add viewport';
        public viewport!: Viewport;
    }

    export class RemoveViewport implements Action {
        readonly type = '[Viewport] Remove viewport';
        public viewportId!: UUID;
    }
}

export type ExerciseAction = InstanceType<
    typeof ExerciseActions[keyof typeof ExerciseActions]
>;

interface Action {
    readonly type: string;
}
