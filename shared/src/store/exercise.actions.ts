import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import {
    Client,
    Material,
    Patient,
    Personnel,
    Vehicle,
    Viewport,
} from '../models';
import { Position } from '../models/utils';
import { UUID, uuidValidationOptions } from '../utils';
import { PatientUpdate } from '../utils/patient-updates';

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
        @IsString()
        public readonly type = '[Viewport] Add viewport';
        @ValidateNested()
        @Type(() => Viewport)
        public readonly viewport!: Viewport;
    }

    export class RemoveViewport implements Action {
        @IsString()
        public readonly type = '[Viewport] Remove viewport';
        @IsUUID(4, uuidValidationOptions)
        public readonly viewportId!: UUID;
    }

    export class AddPatient implements Action {
        @IsString()
        public readonly type = '[Patient] Add patient';
        @ValidateNested()
        @Type(() => Patient)
        public readonly patient!: Patient;
    }

    export class MovePatient implements Action {
        @IsString()
        public readonly type = '[Patient] Move patient';

        @IsUUID(4, uuidValidationOptions)
        public readonly patientId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public readonly targetPosition!: Position;
    }

    export class RemovePatient implements Action {
        @IsString()
        public readonly type = '[Patient] Remove patient';
        @IsUUID(4, uuidValidationOptions)
        public readonly patientId!: UUID;
    }

    export class AddVehicle implements Action {
        @IsString()
        public readonly type = '[Vehicle] Add vehicle';
        @ValidateNested()
        @Type(() => Vehicle)
        public readonly vehicle!: Vehicle;

        @ValidateNested()
        @Type(() => Material)
        public readonly material!: Material;

        @IsArray()
        @ValidateNested({ each: true })
        @Type(() => Personnel)
        public readonly personnel!: readonly Personnel[];
    }

    export class MoveVehicle implements Action {
        @IsString()
        public readonly type = '[Vehicle] Move vehicle';

        @IsUUID(4, uuidValidationOptions)
        public readonly vehicleId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public readonly targetPosition!: Position;
    }

    export class RemoveVehicle implements Action {
        @IsString()
        public readonly type = '[Vehicle] Remove vehicle';
        @IsUUID(4, uuidValidationOptions)
        public readonly vehicleId!: UUID;
    }

    export class UnloadVehicle implements Action {
        @IsString()
        public readonly type = '[Vehicle] Unload vehicle';
        @IsUUID(4, uuidValidationOptions)
        public readonly vehicleId!: UUID;
    }

    export class LoadVehicle implements Action {
        @IsString()
        public readonly type = '[Vehicle] Load vehicle';
        @IsUUID(4, uuidValidationOptions)
        public readonly vehicleId!: UUID;

        @IsString()
        public readonly elementToBeLoadedType!:
            | 'material'
            | 'patient'
            | 'personnel';

        @IsUUID(4, uuidValidationOptions)
        public readonly elementToBeLoadedId!: UUID;
    }

    export class MovePersonnel implements Action {
        @IsString()
        public readonly type = '[Personnel] Move personnel';

        @IsUUID(4, uuidValidationOptions)
        public readonly personnelId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public readonly targetPosition!: Position;
    }

    export class MoveMaterial implements Action {
        @IsString()
        public readonly type = '[Material] Move material';

        @IsUUID(4, uuidValidationOptions)
        public readonly materialId!: UUID;

        @ValidateNested()
        @Type(() => Position)
        public readonly targetPosition!: Position;
    }

    // TODO: Only the server should be able to propose these actions
    export class AddClient implements Action {
        @IsString()
        public readonly type = '[Client] Add client';
        @ValidateNested()
        @Type(() => Client)
        public readonly client!: Client;
    }

    export class RemoveClient implements Action {
        @IsString()
        public readonly type = '[Client] Remove client';
        @IsUUID(4, uuidValidationOptions)
        public readonly clientId!: UUID;
    }

    export class RestrictViewToViewport implements Action {
        @IsString()
        public readonly type = '[Client] Restrict to viewport';
        @IsUUID(4, uuidValidationOptions)
        public readonly clientId!: UUID;
        @IsUUID(4, uuidValidationOptions)
        @IsOptional()
        public readonly viewportId?: UUID;
    }

    export class SetWaitingRoom implements Action {
        @IsString()
        public readonly type = '[Client] Set waitingroom';
        @IsUUID(4, uuidValidationOptions)
        public readonly clientId!: UUID;
        @IsBoolean()
        public readonly shouldBeInWaitingRoom!: boolean;
    }

    export class PauseExercise implements Action {
        @IsString()
        public readonly type = '[Exercise] Pause';
        @IsInt()
        public readonly timestamp!: number;
    }

    export class StartExercise implements Action {
        @IsString()
        public readonly type = '[Exercise] Start';
        @IsInt()
        public readonly timestamp!: number;
    }

    export class ExerciseTick implements Action {
        public readonly type = '[Exercise] Tick';

        @ValidateNested()
        @Type(() => PatientUpdate)
        public readonly patientUpdates!: readonly PatientUpdate[];

        @IsBoolean()
        public readonly refreshTreatments!: boolean;
    }

    export class SetParticipantId implements Action {
        @IsString()
        public readonly type = `[Exercise] Set Participant Id`;
        @IsString()
        public readonly participantId!: string;
    }
}

export type ExerciseAction = InstanceType<
    typeof ExerciseActions[keyof typeof ExerciseActions]
>;

interface Action {
    readonly type: `[${string}] ${string}`;
    /**
     * This timestamp will be refreshed by the server when receiving the action.
     * Only use a field with this name in case you want this behavior.
     */
    timestamp?: number;
}
