import { groupBy } from 'lodash-es';
import type { Material, Personnel } from '../../../models';
import { Patient } from '../../../models';
import type { PatientStatus, Position } from '../../../models/utils';
import type { ExerciseState } from '../../../state';
import type { Mutable, UUIDSet } from '../../../utils';
import { PatientsDataStructure } from '../../../models/patients-datastructure';
import { calculateDistance } from './calculate-distance';
import { getElement } from './get-element';

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
 *
 */
function couldCaterFor(
    status: PatientStatus,
    catering: Mutable<Material> | Mutable<Personnel>,
    catersFor: Mutable<CatersFor>
) {
    // TODO: make it so that e.g. 1 red counts as 2 yellows
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
    return true;
}

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
    // checks if not already full
    if (!couldCaterFor(status, catering, catersFor)) return false;
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

// function isPatient(
//     element: Material | Patient | Personnel
// ): element is Patient {
//     return (element as Patient).personalInformation !== undefined;
// }

function isPersonnel(
    element: Material | Patient | Personnel
): element is Personnel {
    return (element as Personnel).personnelType !== undefined;
}

function isMaterial(
    element: Material | Patient | Personnel
): element is Material {
    // as Material does not include any distinguishable, we will check if it is not of type Personnel or Patient
    return (
        (element as Personnel).personnelType === undefined &&
        (element as Patient).personalInformation === undefined
    );
}
/**
 * @param positions when a patient was moved, positions needs to have old position and new position
 */
export function calculateTreatments(
    state: Mutable<ExerciseState>,
    element: Material | Patient | Personnel,
    positions: Position | [Position, Position]
) {
    const pretriageEnabled = state.configuration.pretriageEnabled;
    const bluePatientsEnabled = state.configuration.bluePatientsEnabled;

    if (isPersonnel(element) || isMaterial(element)) {
        calculateCatering(
            state,
            element,
            pretriageEnabled,
            bluePatientsEnabled
        );
    } else {
        // TODO: get all personnel and material around and call calculateCatering for them
        // do this for the old and new position of a patient, when it was moved
        // if patient, we need to get all personnel and material around
    }
}

function calculateCatering(
    state: Mutable<ExerciseState>,
    catering: Material | Personnel,
    pretriageEnabled: boolean,
    bluePatientsEnabled: boolean
) {
    /**
     * catersFor is the list, how many of which triageCategory each catering (material/personnel) is treating
     */
    const catersFor: CatersFor = {
        red: 0,
        yellow: 0,
        green: 0,
    };

    if (catering.position === undefined) {
        return;
    }
    const patientIdsOfCateredForPatients: Mutable<UUIDSet> = {};
    const patientsDataStructure = PatientsDataStructure.getDataStructure(state);
    const patientsDataInSpecificThreshold =
        PatientsDataStructure.findAllPatientsInCircle(
            patientsDataStructure,
            catering.position,
            specificThreshold
        );
    // having the override circle, if the nearest patients it in the specificThreshold he will be treated, only distance counts
    for (const currentpatientDataInSpecificThreshold of patientsDataInSpecificThreshold) {
        if (currentpatientDataInSpecificThreshold) {
            caterFor(
                catering,
                catersFor,
                getElement(
                    state,
                    'patients',
                    currentpatientDataInSpecificThreshold.id
                ),
                pretriageEnabled,
                bluePatientsEnabled
            );
            patientIdsOfCateredForPatients[
                currentpatientDataInSpecificThreshold.id
            ] = true;
        }
    }
    // if catering could cater for anything more, only then look at patients in the generalThreshold
    if (
        couldCaterFor('red', catering, catersFor) ||
        couldCaterFor('yellow', catering, catersFor) ||
        couldCaterFor('green', catering, catersFor)
    ) {
        const patientsDataInGeneralThreshold =
            PatientsDataStructure.findAllPatientsInCircle(
                patientsDataStructure,
                catering.position,
                generalThreshold
            )
                // filter out every patient in the specificThreshold
                .filter(
                    (patientData) =>
                        patientIdsOfCateredForPatients[patientData.id]
                );
        if (patientsDataInGeneralThreshold.length === 0) {
            // No patients in the generalThreshold radius.
            return;
        }
        const patientsInGeneralThreshold: Patient[] = [];
        for (const currentpatientDataInGeneralThreshold of patientsDataInGeneralThreshold) {
            patientsInGeneralThreshold.push(
                getElement(
                    state,
                    'patients',
                    currentpatientDataInGeneralThreshold.id
                )
            );
        }

        /**
         * distances of every patient to the catering position
         * filtering out every patient that is outside the generalThreshold
         */
        const distances = patientsInGeneralThreshold
            .map((_patientsInGeneralThreshold) => ({
                distance: calculateDistance(
                    catering.position!,
                    _patientsInGeneralThreshold.position!
                ),
                _patientsInGeneralThreshold,
            }))
            // TODO: test if sorting is necessary, it shouldn't be
            .sort(
                ({ distance: distanceA }, { distance: distanceB }) =>
                    distanceA - distanceB
            );

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
        > = groupBy(distances, ({ _patientsInGeneralThreshold }) => {
            const visibleStatus = Patient.getVisibleStatus(
                _patientsInGeneralThreshold,
                pretriageEnabled,
                bluePatientsEnabled
            );
            // Treat untriaged patients as yellow
            return visibleStatus === 'white' ? 'yellow' : visibleStatus;
        });

        /**
         * all red patients in the generalThreshold range, sorting them by distance to the catering
         */
        const redPatients =
            distancesByStatus.red
                // TODO: test if sorting is necessary, it shouldn't be, if true then this whole thing could be away
                ?.sort(
                    ({ distance: distanceA }, { distance: distanceB }) =>
                        distanceA - distanceB
                )
                .map(({ patient }) => patient) ?? [];

        /**
         * all yellow patients (including untriaged patients) in the generalThreshold range, sorting them by distance to the catering
         */
        const yellowPatients =
            distancesByStatus.yellow
                // TODO: test if sorting is necessary, it shouldn't be, if true then this whole thing could be away
                ?.sort(
                    ({ distance: distanceA }, { distance: distanceB }) =>
                        distanceA - distanceB
                )
                .map(({ patient }) => patient) ?? [];

        /**
         * all green patients in the generalThreshold range, sorting them by distance to the catering
         */
        const greenPatients =
            distancesByStatus.green
                // TODO: test if sorting is necessary, it shouldn't be, if true then this whole thing could be away
                ?.sort(
                    ({ distance: distanceA }, { distance: distanceB }) =>
                        distanceA - distanceB
                )
                .map(({ patient }) => patient) ?? [];

        // treat every red patient, closest first, until the capacity is full
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

        // treat every yellow patient, closest first, until the capacity is full
        // NOTE: only treats yellow patients, if no red patients got treated by this catering
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

        // treat every green patient, closest first, until the capacity is full
        // NOTE: only treats green patients, if no yellow patients got treated by this catering
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
}
