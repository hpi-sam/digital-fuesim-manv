import { Patient } from ".";
import { UUID } from "../utils";

export class PatientTemplate {
    public id: UUID;
    public patientProperties: Exclude<Patient, 'id'>;
}
