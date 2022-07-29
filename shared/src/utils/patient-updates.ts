import { IsNumber, IsUUID, Min } from 'class-validator';
import { HealthPoints, IsValidHealthPoint } from '../models/utils';
import { UUID, uuidValidationOptions } from './uuid';

export class PatientUpdate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsValidHealthPoint()
    public readonly nextHealthPoints: HealthPoints;

    @IsUUID(4, uuidValidationOptions)
    public readonly nextStateId: UUID;

    @IsNumber()
    public readonly nextStateTime: number;

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
