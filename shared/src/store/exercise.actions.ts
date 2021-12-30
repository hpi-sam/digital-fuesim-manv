import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { UUID, Viewport, uuidValidationOptions, Patient } from '..';
import type { Immutable } from '../utils/immutability';

/**
 *  These actions are interfaces for immutable JSON objects used to update the store in the frontend and are send to the backend to apply the changes there too.
 *
 *  The classes themself should only be used to validate the JSON objects in the backend, not to create them.
 *  Instead you should use the classes solely as interfaces and instantiate them like this:
 *  ```ts
 *  const action: ExerciseActions.RemoveViewport = {
 *      type: '[Viewport] Remove viewport',
 *      viewportId: 'some-uuid',
 *  };
 *  ```
 *
 *  The constructor of an Action must be callable without any arguments, to allow getting their type-value to validate the action objects in the backend.
 *  The properties of an Action must be decorated with class-validator decorators to allow validating them in the backend.
 */
// Namespaces are basically transpiled to:
// (function (exerciseActions) {
//     exerciseActions.AddViewport = class AddViewport { ... };
//     ...
// })(ExerciseActions || (ExerciseActions = {}))
// The alternative would be to make this directly an object. But in this case we would have to specify the same class-name and the key (not DRY).
// eslint-disable-next-line @typescript-eslint/no-namespace -- TLDR: it is easier to write
export namespace ExerciseActions {
    export class AddViewport implements Action {
        readonly type = '[Viewport] Add viewport';
        @ValidateNested()
        @Type(() => Viewport)
        public viewport!: Viewport;
    }

    export class RemoveViewport implements Action {
        readonly type = '[Viewport] Remove viewport';
        @IsUUID(4, uuidValidationOptions)
        public viewportId!: UUID;
    }

    export class AddPatient implements Action {
        readonly type = '[Patient] Add patient';
        @ValidateNested()
        @Type(() => Patient)
        public patient!: Patient;
    }

    export class RemovePatient implements Action {
        readonly type = '[Patient] Remove patient';
        @IsUUID(4, uuidValidationOptions)
        public patientId!: UUID;
    }
}

export type ExerciseAction = Immutable<
    InstanceType<typeof ExerciseActions[keyof typeof ExerciseActions]>
>;

interface Action {
    readonly type: `[${string}] ${string}`;
}
