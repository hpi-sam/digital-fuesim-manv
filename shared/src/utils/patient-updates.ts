import { IsNumber, IsUUID } from 'class-validator';
import { HealthPoints, IsValidHealthPoint } from '../models/utils';
import { UUID, uuidValidationOptions } from './uuid';

export class PatientUpdate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID;

    @IsValidHealthPoint()
    nextHealthPoints: HealthPoints;

    @IsUUID(4, uuidValidationOptions)
    nextStateId: UUID;

    @IsNumber()
    nextStateTime: number;

    constructor(
        id: UUID,
        nextHealthPoints: HealthPoints,
        nextStateId: UUID,
        nextStateTime: number
    ) {
        this.id = id;
        this.nextHealthPoints = nextHealthPoints;
        this.nextStateId = nextStateId;
        this.nextStateTime = nextStateTime;
    }
}
