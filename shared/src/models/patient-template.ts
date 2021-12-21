import { IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';
import type { Patient } from '.';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested() // TODO: Does this work on Exclude?
    public patientProperties: Exclude<Patient, 'id'>;

    constructor(patientProperties: Exclude<Patient, 'id'>) {
        this.patientProperties = patientProperties;
    }
}
