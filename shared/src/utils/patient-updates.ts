import { IsNumber, IsObject, IsString, IsUUID, Min } from 'class-validator';
import { Catering } from '../models/utils';
import { UUID, uuidValidationOptions } from './uuid';

export class PatientUpdate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsString()
    public readonly nextStateName: string;

    @IsNumber()
    public readonly nextStateTime: number;

    @IsNumber()
    @Min(0)
    public treatmentTime: number;

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
