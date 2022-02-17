import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import {
    UUID,
    Personell,
    Viewport,
    uuidValidationOptions,
    Patient,
    Vehicle,
    Client,
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
        public targetPosition!: Position;
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

        @ValidateNested()
        @Type(() => Material)
        public material!: Material;

        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => Personell)
        public personell!: Personell[];
    }

    export class MoveVehicle implements Action {
        readonly type = '[Vehicle] Move vehicle';

        @IsUUID(4, uuidValidationOptions)
        public vehicleId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public targetPosition!: Position;
    }

    export class RemoveVehicle implements Action {
        readonly type = '[Vehicle] Remove vehicle';
        @IsUUID(4, uuidValidationOptions)
        public vehicleId!: UUID;
    }

    export class UnloadVehicle implements Action {
        readonly type = '[Vehicle] Unload vehicle';
        @IsUUID(4, uuidValidationOptions)
        public vehicleId!: UUID;
    }

    export class LoadVehicle implements Action {
        readonly type = '[Vehicle] Load vehicle';
        @IsUUID(4, uuidValidationOptions)
        public vehicleId!: UUID;

        public elementToBeLoadedType!: 'material' | 'personell';

        @IsUUID(4, uuidValidationOptions)
        public elementToBeLoadedId!: UUID;
    }

    export class MovePersonell implements Action {
        readonly type = '[Personell] Move personell';

        @IsUUID(4, uuidValidationOptions)
        public personellId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public targetPosition!: Position;
    }

    export class MoveMaterial implements Action {
        readonly type = '[Material] Move material';

        @IsUUID(4, uuidValidationOptions)
        public materialId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public targetPosition!: Position;
    }

    // TODO: Only the server should be able to propose these actions
    export class AddClient implements Action {
        readonly type = '[Client] Add client';
        @ValidateNested()
        @Type(() => Client)
        public client!: Client;
    }

    export class RemoveClient implements Action {
        readonly type = '[Client] Remove client';
        @IsUUID(4, uuidValidationOptions)
        public clientId!: UUID;
    }

    export class RestrictViewToViewport implements Action {
        readonly type = '[Client] Restrict to viewport';
        @IsUUID(4, uuidValidationOptions)
        public clientId!: UUID;
        @IsUUID(4, uuidValidationOptions)
        public viewportId?: UUID;
    }

    export class SetWaitingRoom implements Action {
        readonly type = '[Client] Set waitingroom';
        @IsUUID(4, uuidValidationOptions)
        public clientId!: UUID;
        @IsBoolean()
        public shouldBeInWaitingRoom!: boolean;
    }

    export class PauseExercise implements Action {
        readonly type = '[Exercise] Pause';
        @IsInt()
        public timestamp!: number;
    }

    export class StartExercise implements Action {
        readonly type = '[Exercise] Start';
        @IsInt()
        public timestamp!: number;
    }

    export class SetParticipantId implements Action {
        readonly type = `[Exercise] Set Participant Id`;
        @IsString()
        public participantId!: string;
    }
}

export type ExerciseAction = Immutable<
    InstanceType<typeof ExerciseActions[keyof typeof ExerciseActions]>
>;

interface Action {
    readonly type: `[${string}] ${string}`;
    /**
     * This timestamp will be refreshed by the server when receiving the action.
     * Only use a field with this name in case you want this behavior.
     */
    timestamp?: number;
}
