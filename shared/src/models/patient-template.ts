import { IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { Patient } from './patient';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested() // TODO: Does this work on Exclude?
    public patientProperties: Exclude<Patient, 'id'>;

    constructor(patientProperties: Exclude<Patient, 'id'>) {
        this.patientProperties = patientProperties;
    }
}
