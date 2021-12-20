import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { Viewport, UUID, UUIDValidationOptions, Patient } from '..';
import "reflect-metadata"

/**
 *  These actions are POJOS used to update the store in the frontend and are send to the backend to apply the changes there too.
 *
 *  Their constructor must be callable without any arguments, to allow getting their type-value to validate the action objects in the backend
 */
export namespace ExerciseActions {
    export class AddViewport implements Action {
        readonly type = '[Viewport] Add viewport';
        @ValidateNested()
        @Type(() => Viewport)
        public viewport!: Viewport;
    }

    export class RemoveViewport implements Action {
        readonly type = '[Viewport] Remove viewport';
        @IsUUID(4, UUIDValidationOptions)
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
        @IsUUID(4, UUIDValidationOptions)
        public patientId!: UUID;
    }
}

export type ExerciseAction = InstanceType<
    typeof ExerciseActions[keyof typeof ExerciseActions]
>;

interface Action {
    readonly type: string;
}
