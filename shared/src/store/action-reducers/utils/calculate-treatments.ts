import type { Material, Personnel } from '../../../models';
import { Patient } from '../../../models';
import type { PatientStatus, Position } from '../../../models/utils';
import type { ExerciseState } from '../../../state';
import type { Mutable, UUIDSet } from '../../../utils';
import type { MyRBush } from '../../../models/utils/datastructure';
import { DataStructure } from '../../../models/utils/datastructure';
import { ReducerError } from '../../reducer-error';
import { personnelTemplateMap } from '../../../data/default-state/personnel-templates';
import { materialTemplateMap } from '../../../data/default-state/material-templates';
import { getElement } from './get-element';

interface CatersFor {
    red: number;
    yellow: number;
    green: number;
}

function setMaximumThreshold() {
    let result = 0;

    // going through every template and getting the highest specificThreshold
    for (const personnelTemplate of Object.values(personnelTemplateMap)) {
        result = Math.max(result, personnelTemplate.specificThreshold);
    }

    for (const materialTemplate of Object.values(materialTemplateMap)) {
        result = Math.max(result, materialTemplate.specificThreshold);
    }

    // going through every template and getting the highest generalThreshold
    for (const personnelTemplate of Object.values(personnelTemplateMap)) {
        result = Math.max(result, personnelTemplate.generalThreshold);
    }

    for (const materialTemplate of Object.values(materialTemplateMap)) {
        result = Math.max(result, materialTemplate.generalThreshold);
    }

    return result;
}

/**
 * Maximum distance of any personnel or material to treat a patient
 */
const maximumThreshold = setMaximumThreshold();

/**
 * checking wether a material or personnel could check for a patient with {@link status} if already {@link catersFor} x patients
 */
function couldCaterFor(
    status: PatientStatus,
    catering: Mutable<Material> | Mutable<Personnel>,
    catersFor: Mutable<CatersFor>
) {
    // TODO: maybe make blue patients treatable and count them as red patients
    // and maybe make this personnel only be able to treat one blue patient or other patients

    // TODO: understand why it seems to be not necessary (could be that just the lines are not shown - try it putting e.g. a material on top of a dead patient)
    // black and blue patients can't be treated
    if (status === 'black' || status === 'blue') {
        return false;
    }
    // if logicalOperator === 'and' catering capacity is calculated cumulatively
    const canCaterForRed = catering.canCaterFor.red;
    const canCaterForYellow =
        catering.canCaterFor.logicalOperator === 'and'
            ? canCaterForRed + catering.canCaterFor.yellow
            : catering.canCaterFor.yellow;
    const canCaterForGreen =
        catering.canCaterFor.logicalOperator === 'and'
            ? canCaterForYellow + catering.canCaterFor.green
            : catering.canCaterFor.green;
    if (
        (status === 'red' && canCaterForRed <= catersFor.red) ||
        (status === 'yellow' && canCaterForYellow <= catersFor.yellow) ||
        (status === 'green' && canCaterForGreen <= catersFor.green)
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
        // We are already treating someone of another category and cannot treat multiple categories as logcialOperator === 'or'.
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

    // save catering.id in patient for more efficient calculating
    if (isPersonnel(catering)) {
        patient.assignedPersonnelIds[catering.id] = true;
    } else {
        patient.assignedMaterialIds[catering.id] = true;
    }

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

function isPatient(
    element: Material | Patient | Personnel
): element is Patient {
    return (element as Patient).personalInformation !== undefined;
}

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

function isPositionArray(
    positions: Position | [Position, Position]
): positions is [Position, Position] {
    return (
        (positions as [Position, Position])[0] !== undefined &&
        (positions as [Position, Position])[1] !== undefined
    );
}

/**
 *
 * @param dataStructure being of elementType
 * @param position of the patient where all elements of elementType should be recalculated
 * @param elementType used for elementType in dataStructure
 */
function calculateCateringForDataStructure(
    state: Mutable<ExerciseState>,
    pretriageEnabled: boolean,
    bluePatientsEnabled: boolean,
    patientsDataStructure: MyRBush,
    dataStructure: MyRBush,
    position: Position,
    elementType: 'materials' | 'personnel',
    elementIdsToBeSkipped: UUIDSet = {}
) {
    const elementsInGeneralThreshold = DataStructure.findAllElementsInCircle(
        dataStructure,
        position,
        maximumThreshold
    ).filter((elementData) => !elementIdsToBeSkipped[elementData.id]);

    for (const datastructureElement of elementsInGeneralThreshold) {
        calculateCatering(
            state,
            getElement(state, elementType, datastructureElement.id),
            pretriageEnabled,
            bluePatientsEnabled,
            patientsDataStructure
        );
    }
}

function removeTreatmentsOfElement(
    state: Mutable<ExerciseState>,
    element: Material | Patient | Personnel
) {
    if (isPatient(element)) {
        const patient = getElement(state, 'patients', element.id);
        // go through every personnel that treats this patient and remove that it is treated by it (bi-directional)
        for (const personnelId of Object.keys(patient.assignedPersonnelIds)) {
            const personnel = getElement(state, 'personnel', personnelId);
            delete personnel.assignedPatientIds[patient.id];
            delete patient.assignedPersonnelIds[personnelId];
            // if this personnel was the last treating this patient, set this patient to be not treated anymore
            if (patient.assignedPersonnelIds === {}) {
                patient.isBeingTreated = false;
            }
        }
        // go through every material that treats this patient and remove that it is treated by it (bi-directional)
        for (const materialId of Object.keys(patient.assignedMaterialIds)) {
            const material = getElement(state, 'materials', materialId);
            delete material.assignedPatientIds[patient.id];
            delete patient.assignedMaterialIds[materialId];
        }
    } else if (isPersonnel(element)) {
        const personnel = getElement(state, 'personnel', element.id);
        // go through every patient and remove being treated by this personnel
        for (const patientId of Object.keys(personnel.assignedPatientIds)) {
            const patient = getElement(state, 'patients', patientId);
            delete personnel.assignedPatientIds[patientId];
            delete patient.assignedPersonnelIds[personnel.id];
            // if this personnel was the last treating this patient, set the patient to be not treated anymore
            if (patient.assignedPersonnelIds === {}) {
                patient.isBeingTreated = false;
            }
        }
    } else if (isMaterial(element)) {
        const material = getElement(state, 'materials', element.id);
        // go through every patient and remove being treated by this material
        for (const patientId of Object.keys(material.assignedPatientIds)) {
            const patient = getElement(state, 'patients', patientId);
            delete material.assignedPatientIds[patientId];
            delete patient.assignedMaterialIds[material.id];
        }
    }
}

/**
 * @param positions when a patient was moved, positions needs to have old position and new position
 *                  when positions is undefined, it means all treatments from this element should be removed
 * @param personnelDataStructure only needed when element is a patient
 * @param materialsDataStructure only needed when element is a patient
 * @param elementIdsToBeSkipped with this you can ignore e.g. personnel and material that was already calculated before (e.g. see unloadVehicle)
 */
export function calculateTreatments(
    state: Mutable<ExerciseState>,
    element: Material | Patient | Personnel,
    positions: Position | [Position, Position] | undefined,
    patientsDataStructure?: MyRBush,
    personnelDataStructure?: MyRBush,
    materialsDataStructure?: MyRBush,
    elementIdsToBeSkipped: UUIDSet = {}
) {
    // if position is undefined, the element is no longer in a position (get it?!) to be treated or treat a patient
    if (positions === undefined) {
        removeTreatmentsOfElement(state, element);
        return;
    }

    if (patientsDataStructure === undefined) {
        throw new ReducerError(
            'patientsDataStructure was not defined, but calculateTreatments was called with an element that has positions set to something, not setting patientsDataStructure is only allowed for positions === undefined'
        );
    }

    const pretriageEnabled = state.configuration.pretriageEnabled;
    const bluePatientsEnabled = state.configuration.bluePatientsEnabled;

    // if element is personnel or material we just calculate catering for this element
    if (isPersonnel(element) || isMaterial(element)) {
        calculateCatering(
            state,
            element,
            pretriageEnabled,
            bluePatientsEnabled,
            patientsDataStructure
        );
    } else {
        if (personnelDataStructure === undefined) {
            throw new ReducerError(
                'personnelDataStructure was not defined, but calculateTreatments was called with element being a patient'
            );
        }
        if (materialsDataStructure === undefined) {
            throw new ReducerError(
                'materialsDataStructure was not defined, but calculateTreatments was called with element being a patient'
            );
        }
        // element is patient: calculating for every personnel and material around the patient position(s)

        // if patient moved (has startPosition and targetPosition)
        if (isPositionArray(positions)) {
            // recalculating catering for every personnel around the position a patient was
            calculateCateringForDataStructure(
                state,
                pretriageEnabled,
                bluePatientsEnabled,
                patientsDataStructure,
                personnelDataStructure,
                positions[0],
                'personnel',
                elementIdsToBeSkipped
            );
            // calculating catering for every personnel around the position the patient is now
            calculateCateringForDataStructure(
                state,
                pretriageEnabled,
                bluePatientsEnabled,
                patientsDataStructure,
                personnelDataStructure,
                positions[1],
                'personnel',
                elementIdsToBeSkipped
            );
            // recalculating catering for every material around the position a patient was
            calculateCateringForDataStructure(
                state,
                pretriageEnabled,
                bluePatientsEnabled,
                patientsDataStructure,
                materialsDataStructure,
                positions[0],
                'materials',
                elementIdsToBeSkipped
            );
            // calculating catering for every material around the position the patient is now
            calculateCateringForDataStructure(
                state,
                pretriageEnabled,
                bluePatientsEnabled,
                patientsDataStructure,
                materialsDataStructure,
                positions[1],
                'materials',
                elementIdsToBeSkipped
            );
        } else {
            // else: patient was not moved and had no position before (was added/unloaded)
            calculateCateringForDataStructure(
                state,
                pretriageEnabled,
                bluePatientsEnabled,
                patientsDataStructure,
                personnelDataStructure,
                positions,
                'personnel',
                elementIdsToBeSkipped
            );
            calculateCateringForDataStructure(
                state,
                pretriageEnabled,
                bluePatientsEnabled,
                patientsDataStructure,
                materialsDataStructure,
                positions,
                'materials',
                elementIdsToBeSkipped
            );
        }

        /**
         * patient got new treatment and updated all possible personnel and material, therefore setting {@link needsNewCalculateTreatments} to false
         */
        getElement(state, 'patients', element.id).needsNewCalculateTreatments =
            false;
    }
}

function calculateCatering(
    state: Mutable<ExerciseState>,
    catering: Material | Personnel,
    pretriageEnabled: boolean,
    bluePatientsEnabled: boolean,
    patientsDataStructure: MyRBush
) {
    // reset treatment of this catering (material/personal) and start over again
    // TODO: maybe use diff (only removing ones that are not treated anymore) - low priority as this is not much cost, as all ids are known
    removeTreatmentsOfElement(state, catering);

    /**
     * catersFor is the list, how many of which triageCategory catering (material/personnel) is treating
     */
    const catersFor: CatersFor = {
        red: 0,
        yellow: 0,
        green: 0,
    };

    if (catering.position === undefined) {
        return;
    }

    /**
     * maximum number of patients catering (personnel/material) could treat at the same time
     */
    const maxPatientsCouldCaterFor =
        catering.canCaterFor.logicalOperator === 'or'
            ? Math.max(
                  catering.canCaterFor.green,
                  catering.canCaterFor.yellow,
                  catering.canCaterFor.red
              )
            : // logicalOperator === 'and', capacity is cumulative
              catering.canCaterFor.green +
              catering.canCaterFor.yellow +
              catering.canCaterFor.red;

    /**
     * saving patientIds of patients that got already treated in specificThreshold, to filter them out when getting patients in generalThreshold
     */
    const patientIdsOfCateredForPatients: Mutable<UUIDSet> = {};

    const patientsDataInSpecificThreshold =
        DataStructure.findAllElementsInCircle(
            patientsDataStructure,
            catering.position,
            catering.specificThreshold,
            maxPatientsCouldCaterFor
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
            DataStructure.findAllElementsInCircle(
                patientsDataStructure,
                catering.position,
                catering.generalThreshold,
                maxPatientsCouldCaterFor
            )
                // filter out every patient in the specificThreshold
                .filter(
                    (patientData) =>
                        // TODO: removing the ! makes the code break, but it should just recalculate for every patient again?!
                        !patientIdsOfCateredForPatients[patientData.id]
                );

        if (patientsDataInGeneralThreshold.length === 0) {
            // No patients in the generalThreshold radius.
            return;
        }

        const patientsInGeneralThreshold: Mutable<Patient>[] = [];
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
         * all red patients in the generalThreshold range, sorting them by distance to the catering
         */
        const redPatients = patientsInGeneralThreshold.filter(
            (patient) =>
                Patient.getVisibleStatus(
                    patient,
                    pretriageEnabled,
                    bluePatientsEnabled
                ) === 'red'
        );

        // TODO: don't even filter out yellow and green patients, when they can't be treated anyway (maybe include it directly below, and use return instead of break)

        /**
         * all yellow patients (including untriaged patients) in the generalThreshold range, sorting them by distance to the catering
         */
        const yellowPatients = patientsInGeneralThreshold.filter((patient) => {
            const visibleStatus = Patient.getVisibleStatus(
                patient,
                pretriageEnabled,
                bluePatientsEnabled
            );
            // Treat untriaged patients as yellow
            return visibleStatus === 'yellow' || visibleStatus === 'white';
        });

        /**
         * all green patients in the generalThreshold range, sorting them by distance to the catering
         */
        const greenPatients = patientsInGeneralThreshold.filter(
            (patient) =>
                Patient.getVisibleStatus(
                    patient,
                    pretriageEnabled,
                    bluePatientsEnabled
                ) === 'green'
        );

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
        // NOTE: only treats yellow patients, if no red patients got treated by this catering when catersFor.logicalOperator is set to 'or'
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
        // NOTE: only treats green patients, if no yellow patients got treated by this catering when catersFor.logicalOperator is set to 'or'
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
