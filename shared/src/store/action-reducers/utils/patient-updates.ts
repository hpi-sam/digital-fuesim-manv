import { IsNumber, IsUUID, Min } from 'class-validator';
import { HealthPoints, IsValidHealthPoint } from '../../../models/utils';
import { UUID, uuidValidationOptions } from '../../../utils/uuid';

export class PatientUpdate {
    /**
     * The id of the patient
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    /**
     * The new {@link HealthPoints} the patient should have
     */
    @IsValidHealthPoint()
    public readonly nextHealthPoints: HealthPoints;

    /**
     * The next {@link PatientHealthState} the patient should be in
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly nextStateId: UUID;

    /**
     * The new state time of the patient
     */
    @IsNumber()
    public readonly nextStateTime: number;

    /**
     * The time a patient was treated overall
     */
    @IsNumber()
    @Min(0)
    public treatmentTime: number;

    constructor(
        id: UUID,
        nextHealthPoints: HealthPoints,
        nextStateId: UUID,
        nextStateTime: number,
        treatmentTime: number
    ) {
        this.id = id;
        this.nextHealthPoints = nextHealthPoints;
        this.nextStateId = nextStateId;
        this.nextStateTime = nextStateTime;
        this.treatmentTime = treatmentTime;
    }
}
