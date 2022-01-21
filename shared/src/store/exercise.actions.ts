import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import {
    UUID,
    Viewport,
    uuidValidationOptions,
    Patient,
    Vehicle,
    Personell,
    Material,
} from '..';
import { Position } from '../models/utils';
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

    export class MovePatient implements Action {
        readonly type = '[Patient] Move patient';

        @IsUUID(4, uuidValidationOptions)
        public patientId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public position!: Position;
    }

    export class RemovePatient implements Action {
        readonly type = '[Patient] Remove patient';
        @IsUUID(4, uuidValidationOptions)
        public patientId!: UUID;
    }

    export class AddVehicle implements Action {
        readonly type = '[Vehicle] Add vehicle';
        @ValidateNested()
        @Type(() => Vehicle)
        public vehicle!: Vehicle;
    }

    export class MoveVehicle implements Action {
        readonly type = '[Vehicle] Move vehicle';

        @IsUUID(4, uuidValidationOptions)
        public vehicleId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public position!: Position;
    }

    export class RemoveVehicle implements Action {
        readonly type = '[Vehicle] Remove vehicle';
        @IsUUID(4, uuidValidationOptions)
        public vehicleId!: UUID;
    }

    export class AddPersonell implements Action {
        readonly type = '[Personell] Add personell';
        @ValidateNested()
        @Type(() => Personell)
        public personell!: Personell;
    }

    export class MovePersonell implements Action {
        readonly type = '[Personell] Move personell';

        @IsUUID(4, uuidValidationOptions)
        public personellId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public position!: Position;
    }

    export class RemovePersonell implements Action {
        readonly type = '[Personell] Remove personell';
        @IsUUID(4, uuidValidationOptions)
        public personellId!: UUID;
    }

    export class AddMaterial implements Action {
        readonly type = '[Material] Add material';
        @ValidateNested()
        @Type(() => Material)
        public material!: Material;
    }

    export class MoveMaterial implements Action {
        readonly type = '[Material] Move material';

        @IsUUID(4, uuidValidationOptions)
        public materialId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public position!: Position;
    }

    export class RemoveMaterial implements Action {
        readonly type = '[Material] Remove material';
        @IsUUID(4, uuidValidationOptions)
        public materialId!: UUID;
    }
}

export type ExerciseAction = Immutable<
    InstanceType<typeof ExerciseActions[keyof typeof ExerciseActions]>
>;

interface Action {
    readonly type: `[${string}] ${string}`;
}
