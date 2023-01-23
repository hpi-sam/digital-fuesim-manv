import {
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsString,
    IsUUID,
    MaxLength,
    Min,
} from 'class-validator';
import { Catering } from '../../../models/utils';
import { UUID, uuidValidationOptions } from '../../../utils/uuid';

export class PatientUpdate {
    /**
     * The id of the patient
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    /**
     * The next {@link PatientHealthState} the patient should be in
     */
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    public readonly nextStateName: string;

    /**
     * The new state time of the patient
     */
    @IsNumber()
    public readonly nextStateTime: number;

    /**
     * The new time a patient was treated overall
     */
    @IsNumber()
    @Min(0)
    public treatmentTime: number;

    /**
     * The resources of the {@link Patient} in this tick
     */
    // TODO: Better validation
    @IsObject()
    public newTreatment: Catering;

    constructor(
        id: UUID,
        nextStateName: string,
        nextStateTime: number,
        treatmentTime: number,
        newTreatment: Catering
    ) {
        this.id = id;
        this.nextStateName = nextStateName;
        this.nextStateTime = nextStateTime;
        this.treatmentTime = treatmentTime;
        this.newTreatment = newTreatment;
    }
}
