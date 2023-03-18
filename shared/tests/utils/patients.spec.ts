import { generateDummyPatient } from '../../src/data';
import { Patient } from '../../src/models';
import type { PatientStatus, Position } from '../../src/models/utils';
import {
    currentCoordinatesOf,
    isOnMap,
    SpatialTree,
} from '../../src/models/utils';
import type { ExerciseState } from '../../src/state';
import type { Mutable } from '../../src/utils';
import { cloneDeepMutable } from '../../src/utils';

export function addPatient(
    state: Mutable<ExerciseState>,
    pretriageStatus: PatientStatus,
    realStatus: PatientStatus,
    position?: Position
): Mutable<Patient> {
    const patient = cloneDeepMutable(generateDummyPatient());
    patient.pretriageStatus = pretriageStatus;
    if (pretriageStatus !== 'white') {
        patient.treatmentTime = Patient.pretriageTimeThreshold;
    }
    patient.realStatus = realStatus;
    if (position) {
        patient.position = cloneDeepMutable(position);

        if (isOnMap(patient)) {
            SpatialTree.addElement(
                state.spatialTrees.patients,
                patient.id,
                currentCoordinatesOf(patient)
            );
        }
    }
    state.patients[patient.id] = patient;
    return patient;
}
