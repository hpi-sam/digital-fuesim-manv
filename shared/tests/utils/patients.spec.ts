import { generateDummyPatient } from '../../src/data';
import type { Patient } from '../../src/models';
import type { MapCoordinates, PatientStatus } from '../../src/models/utils';
import { currentCoordinatesOf, SpatialTree } from '../../src/models/utils';
import type { ExerciseState } from '../../src/state';
import type { Mutable } from '../../src/utils';
import { cloneDeepMutable } from '../../src/utils';

export function addPatient(
    state: Mutable<ExerciseState>,
    pretriageStatus: PatientStatus,
    realStatus: PatientStatus,
    position?: MapCoordinates
): Mutable<Patient> {
    const patient = cloneDeepMutable(generateDummyPatient());
    patient.pretriageStatus = pretriageStatus;
    patient.realStatus = realStatus;
    if (position) {
        patient.position = {
            type: 'coordinates',
            coordinates: cloneDeepMutable(position),
        };

        SpatialTree.addElement(
            state.spatialTrees.patients,
            patient.id,
            currentCoordinatesOf(patient)
        );
    }
    state.patients[patient.id] = patient;
    return patient;
}
