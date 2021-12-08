import { Patient } from '.';
import { UUID, uuid } from '../utils';

export class PatientTemplate {
    public id: UUID = uuid();

    constructor(public patientProperties: Exclude<Patient, 'id'>) {}
}
