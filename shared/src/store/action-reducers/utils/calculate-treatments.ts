import { groupBy } from 'lodash-es';
import type { Material, Personnel } from '../../../models';
import { Patient } from '../../../models';
import type { PatientStatus } from '../../../models/utils';
import type { ExerciseState } from '../../../state';
import type { Mutable } from '../../../utils';
import { calculateDistance } from './calculate-distance';

interface CatersFor {
    red: number;
    yellow: number;
    green: number;
}

/**
 * Maximum distance to treat the exact nearest patient
 */
const specificThreshold = 0.5;

/**
 * Maximum distance to treat any patient
 */
const generalThreshold = 5;

/**
 * Tries to assign the {@link patient} to {@link catering} (side effect).
 * @returns Whether the patient can be catered for by {@link catering}.
 */
function caterFor(
    catering: Mutable<Material> | Mutable<Personnel>,
    catersFor: Mutable<CatersFor>,
    patient: Mutable<Patient>,
    pretriageEnabled: boolean,
    bluePatientsEnabled: boolean
) {
    // Treat not pretriaged patients as yellow.
    const visibleStatus = Patient.getVisibleStatus(
        patient,
        pretriageEnabled,
        bluePatientsEnabled
    );
    const status = visibleStatus === 'white' ? 'yellow' : visibleStatus;
    if (
        (status === 'red' && catering.canCaterFor.red <= catersFor.red) ||
        (status === 'yellow' &&
            catering.canCaterFor.yellow <= catersFor.yellow) ||
        (status === 'green' && catering.canCaterFor.green <= catersFor.green)
    ) {
        // Capacity for the status of the patient is no longer there.
        return false;
    }
    if (
        catering.canCaterFor.logicalOperator === 'or' &&
        ((status === 'red' && (catersFor.yellow > 0 || catersFor.green > 0)) ||
            (status === 'yellow' &&
                (catersFor.red > 0 || catersFor.green > 0)) ||
            (status === 'green' && (catersFor.yellow > 0 || catersFor.red > 0)))
    ) {
        // We are already treating someone of another category and cannot treat multiple categories.
        return false;
    }
    catering.assignedPatientIds[patient.id] = true;
    patient.isBeingTreated = true;

    switch (status) {
        case 'red':
            catersFor.red++;
            break;
        case 'yellow':
            catersFor.yellow++;
            break;
        case 'green':
            catersFor.green++;
            break;
        default:
            break;
    }
    return true;
}

export function calculateTreatments(state: Mutable<ExerciseState>) {
    const pretriageEnabled = state.configuration.pretriageEnabled;
    const bluePatientsEnabled = state.configuration.bluePatientsEnabled;
    const personnels = Object.values(state.personnel).filter(
        (personnel) => personnel.position !== undefined
    );
    const materials = Object.values(state.materials).filter(
        (material) => material.position !== undefined
    );
    // Unassign all patients as we are calculating everything from scratch.
    personnels.forEach((personnel) => {
        personnel.assignedPatientIds = {};
    });
    materials.forEach((material) => {
        material.assignedPatientIds = {};
    });
    const patients = Object.values(state.patients).filter((patient) => {
        const visibleStatus = Patient.getVisibleStatus(
            patient,
            pretriageEnabled,
            bluePatientsEnabled
        );
        return (
            patient.position !== undefined &&
            visibleStatus !== 'black' &&
            visibleStatus !== 'blue'
        );
    });
    patients.forEach((patient) => {
        patient.isBeingTreated = false;
    });
    if (patients.length === 0) {
        // Don't treat anyone. No one (alive) is there.
        return;
    }
    // We ignore whether a patient is already treated
    // and the patient is just added to the list of treated patients.
    personnels.forEach((personnel) => {
        calculateCatering(
            personnel,
            patients,
            pretriageEnabled,
            bluePatientsEnabled
        );
    });
    materials.forEach((material) => {
        calculateCatering(
            material,
            patients,
            pretriageEnabled,
            bluePatientsEnabled
        );
    });
}

function calculateCatering(
    catering: Material | Personnel,
    patients: Mutable<Patient>[],
    pretriageEnabled: boolean,
    bluePatientsEnabled: boolean
) {
    const catersFor: CatersFor = {
        red: 0,
        yellow: 0,
        green: 0,
    };
    const distances = patients
        .map((patient) => ({
            distance: calculateDistance(catering.position!, patient.position!),
            patient,
        }))
        .filter(({ distance }) => distance <= generalThreshold)
        .sort(
            ({ distance: distanceA }, { distance: distanceB }) =>
                distanceA - distanceB
        );
    if (distances.length === 0) {
        // No patients in the radius.
        return;
    }
    if (distances[0]!.distance <= specificThreshold) {
        caterFor(
            catering,
            catersFor,
            distances[0]!.patient,
            pretriageEnabled,
            bluePatientsEnabled
        );
    }
    // The typings of groupBy are not correct (group keys could be missing if there are no such elements in the array)
    const distancesByStatus: Partial<
        // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
        Record<
            PatientStatus,
            {
                distance: number;
                patient: Mutable<Patient>;
            }[]
        >
    > = groupBy(distances, ({ patient }) => {
        const visibleStatus = Patient.getVisibleStatus(
            patient,
            pretriageEnabled,
            bluePatientsEnabled
        );
        // Treat untriaged patients as yellow
        return visibleStatus === 'white' ? 'yellow' : visibleStatus;
    });

    const redPatients =
        distancesByStatus.red
            ?.sort(
                ({ distance: distanceA }, { distance: distanceB }) =>
                    distanceA - distanceB
            )
            .map(({ patient }) => patient) ?? [];

    const yellowPatients =
        distancesByStatus.yellow
            ?.sort(
                ({ distance: distanceA }, { distance: distanceB }) =>
                    distanceA - distanceB
            )
            .map(({ patient }) => patient) ?? [];

    const greenPatients =
        distancesByStatus.green
            ?.sort(
                ({ distance: distanceA }, { distance: distanceB }) =>
                    distanceA - distanceB
            )
            .map(({ patient }) => patient) ?? [];

    for (const patient of redPatients) {
        if (
            !caterFor(
                catering,
                catersFor,
                patient,
                pretriageEnabled,
                bluePatientsEnabled
            )
        ) {
            break;
        }
    }

    for (const patient of yellowPatients) {
        if (
            !caterFor(
                catering,
                catersFor,
                patient,
                pretriageEnabled,
                bluePatientsEnabled
            )
        ) {
            break;
        }
    }

    for (const patient of greenPatients) {
        if (
            !caterFor(
                catering,
                catersFor,
                patient,
                pretriageEnabled,
                bluePatientsEnabled
            )
        ) {
            break;
        }
    }
}
