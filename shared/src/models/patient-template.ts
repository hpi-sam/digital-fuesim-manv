import { IsUUID, ValidateNested } from 'class-validator';
import { Patient } from '.';
import { UUID, uuid, UUIDValidationOptions } from '../utils';

export class PatientTemplate {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @ValidateNested() // TODO: Does this work on Exclude?
    public patientProperties: Exclude<Patient, 'id'>;

    constructor(patientProperties: Exclude<Patient, 'id'>) {
        this.patientProperties = patientProperties;
    }
}
