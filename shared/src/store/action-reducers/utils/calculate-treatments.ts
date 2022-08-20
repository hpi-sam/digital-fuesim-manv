import { isEmpty } from 'lodash-es';
import type { Material, Personnel } from '../../../models';
import { Patient } from '../../../models';
import type { PatientStatus, Position } from '../../../models/utils';
import { SpatialTree } from '../../../models/utils/spatial-tree';
import type { ExerciseState } from '../../../state';
import { maxGlobalThreshold } from '../../../state-helpers/max-global-threshold';
import type { Mutable, UUID } from '../../../utils';
import { getElement } from './get-element';

/**
 * How many of which triageCategory a personnel/material is treating
 */
interface CatersFor {
    red: number;
    yellow: number;
    green: number;
}

/**
 * @returns wether a material or personnel could treat a patient with {@link status} if it already {@link catersFor} patients
 */
function couldCaterFor(
    status: Exclude<PatientStatus, 'white'>,
    cateringElement: Mutable<Material | Personnel>,
    catersFor: Mutable<CatersFor>
) {
    // black can't be treated (anymore) and blue patients should not (yet) be treated
    if (status === 'black' || status === 'blue') {
        return false;
    }
    if (cateringElement.canCaterFor.logicalOperator === 'or') {
        const numberOfTreatedCategories = Object.entries(
            cateringElement.canCaterFor
        ).filter(
            ([category, canCaterFor]) =>
                // Will be treated
                status === category ||
                // Is already treated
                canCaterFor > 0
        ).length;
        return (
            // Only one category can be treated
            numberOfTreatedCategories <= 1 &&
            catersFor[status] <= cateringElement.canCaterFor[status]
        );
    }

    let availableCapacity = 0;
    for (const category of ['red', 'yellow', 'green'] as const) {
        // The catering capacity is calculated cumulatively - a red slot can also teat a yellow one instead
        availableCapacity +=
            cateringElement.canCaterFor[category] - catersFor[category];
        if (status === category && availableCapacity >= 1) {
            return true;
        }
    }
    return false;
}

/**
 * Tries to assign the {@link patient} to {@link catering} (side effect).
 * @returns Whether the patient can be catered for by {@link catering}.
 */
function caterFor(
    catering: Mutable<Material | Personnel>,
    catersFor: Mutable<CatersFor>,
    patient: Mutable<Patient>,
    pretriageEnabled: boolean,
    bluePatientsEnabled: boolean
) {
    const status = getCateringStatus(
        Patient.getVisibleStatus(patient, pretriageEnabled, bluePatientsEnabled)
    );

    if (!couldCaterFor(status, catering, catersFor)) {
        return false;
    }

    catering.assignedPatientIds[patient.id] = true;
    patient.isBeingTreated = true;

    if (isPersonnel(catering)) {
        patient.assignedPersonnelIds[catering.id] = true;
    } else {
        patient.assignedMaterialIds[catering.id] = true;
    }

    catersFor[status as 'green' | 'red' | 'yellow']++;
    return true;
}

// TODO: Instead, give each Element a "type" property -> discriminated union
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

/**
 * @param position of the patient where all elements of elementType should be recalculated
 */
function updateCateringAroundPatient(
    state: Mutable<ExerciseState>,
    position: Position,
    elementType: 'materials' | 'personnel',
    elementIdsToBeSkipped: Set<UUID>
) {
    const elementsInGeneralThreshold = SpatialTree.findAllElementsInCircle(
        state.spatialTrees[elementType],
        // False positive
        // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
        position,
        maxGlobalThreshold
    ).filter((elementId) => !elementIdsToBeSkipped.has(elementId));

    for (const elementId of elementsInGeneralThreshold) {
        updateCatering(state, getElement(state, elementType, elementId));
    }
}

function removeTreatmentsOfElement(
    state: Mutable<ExerciseState>,
    element: Material | Patient | Personnel
) {
    if (isPatient(element)) {
        const patient = getElement(state, 'patients', element.id);
        // Make all personnel stop treating this patient
        for (const personnelId of Object.keys(patient.assignedPersonnelIds)) {
            const personnel = getElement(state, 'personnel', personnelId);
            delete personnel.assignedPatientIds[patient.id];
        }
        patient.assignedPersonnelIds = {};
        patient.isBeingTreated = false;
        // Make all material stop treating this patient
        for (const materialId of Object.keys(patient.assignedMaterialIds)) {
            const material = getElement(state, 'materials', materialId);
            delete material.assignedPatientIds[patient.id];
        }
        patient.assignedMaterialIds = {};
    } else if (isPersonnel(element)) {
        const personnel = getElement(state, 'personnel', element.id);
        // This personnel doesn't treat any patients anymore
        for (const patientId of Object.keys(personnel.assignedPatientIds)) {
            const patient = getElement(state, 'patients', patientId);
            delete patient.assignedPersonnelIds[personnel.id];
            patient.isBeingTreated = !isEmpty(patient.assignedPersonnelIds);
        }
        personnel.assignedPatientIds = {};
    } else if (isMaterial(element)) {
        const material = getElement(state, 'materials', element.id);
        // This material doesn't treat any patients anymore
        for (const patientId of Object.keys(material.assignedPatientIds)) {
            const patient = getElement(state, 'patients', patientId);
            delete patient.assignedMaterialIds[material.id];
        }
        material.assignedPatientIds = {};
    }
}

/**
 * @param element.position is important:
 *     - if an element was moved: {@link element.position} needs the new position
 *     - if treatment of an element should be removed: set {@link element.position} to `undefined`
 * @param elementIdsToBeSkipped with this you can ignore e.g. personnel and material that was already updated before (e.g. see unloadVehicle)
 */
export function updateTreatments(
    state: Mutable<ExerciseState>,
    element: Mutable<Material | Patient | Personnel>,
    elementIdsToBeSkipped = new Set<UUID>()
) {
    // The requirement of this function is neither to result in a "perfect" treatment pattern
    // nor to be independent from its history (calculating the treatments from scratch is allowed to differ
    // from a solution that has been incrementally produced by calls to this function)

    if (element.position === undefined) {
        // The element is no longer in a position (get it?!) to be treated or treat a patient
        removeTreatmentsOfElement(state, element);
        return;
    }

    if (isPersonnel(element) || isMaterial(element)) {
        updateCatering(state, element);
        return;
    }

    // Update every personnel and material that was assigned to the patient
    for (const personnelId of Object.keys(element.assignedPersonnelIds)) {
        updateCatering(state, getElement(state, 'personnel', personnelId));
        // Saving personnelIds of personnel that already got calculated - makes small movements of patients more efficient
        elementIdsToBeSkipped.add(personnelId);
    }
    for (const materialId of Object.keys(element.assignedMaterialIds)) {
        updateCatering(state, getElement(state, 'materials', materialId));
        // Saving materialIds of material that already got calculated - makes small movements of patients more efficient
        elementIdsToBeSkipped.add(materialId);
    }

    updateCateringAroundPatient(
        state,
        element.position,
        'personnel',
        elementIdsToBeSkipped
    );
    updateCateringAroundPatient(
        state,
        element.position,
        'materials',
        elementIdsToBeSkipped
    );

    // Patient got new treatment and updated all possible personnel and material
    getElement(state, 'patients', element.id).needsNewCalculateTreatments =
        false;
}

function updateCatering(
    state: Mutable<ExerciseState>,
    cateringElement: Mutable<Material | Personnel>
) {
    // Reset treatment of this catering (material/personnel) and start over again
    removeTreatmentsOfElement(state, cateringElement);

    // When it can't treat anything, just skip this element
    // Doing this behind removeTreatmentsOfElement to catch the case someone changed via export import
    // the canCaterFor to 0 while an Element is treating something in the exported state
    if (
        (cateringElement.canCaterFor.red === 0 &&
            cateringElement.canCaterFor.yellow === 0 &&
            cateringElement.canCaterFor.green === 0) ||
        // The element is no longer in a position to treat a patient
        cateringElement.position === undefined
    ) {
        return;
    }

    const catersFor: CatersFor = {
        red: 0,
        yellow: 0,
        green: 0,
    };

    // Patients that got already treated in specificThreshold should not be treated again in generalThreshold
    const cateredForPatients = new Set<UUID>();

    if (cateringElement.specificThreshold > 0) {
        const patientIdsInSpecificThreshold =
            SpatialTree.findAllElementsInCircle(
                state.spatialTrees.patients,
                cateringElement.position,
                cateringElement.specificThreshold
            );
        // In the specificThreshold (the override circle) only the distance to the patient is important - his injuries are ignored
        for (const patientId of patientIdsInSpecificThreshold) {
            caterFor(
                cateringElement,
                catersFor,
                getElement(state, 'patients', patientId),
                state.configuration.pretriageEnabled,
                state.configuration.bluePatientsEnabled
            );
            cateredForPatients.add(patientId);
        }
    }

    if (
        cateringElement.generalThreshold <= 0 ||
        // Only look for more patients to treat, if there still is capacity (performance improvement)
        (!couldCaterFor('red', cateringElement, catersFor) &&
            !couldCaterFor('yellow', cateringElement, catersFor) &&
            !couldCaterFor('green', cateringElement, catersFor))
    ) {
        return;
    }

    const patientsInGeneralThreshold: Mutable<Patient>[] =
        SpatialTree.findAllElementsInCircle(
            state.spatialTrees.patients,
            cateringElement.position,
            cateringElement.generalThreshold
        )
            // Filter out every patient in the specificThreshold
            .filter(
                (patientId) =>
                    // TODO: removing the ! makes the code break, but it should just recalculate for every patient again?!
                    !cateredForPatients.has(patientId)
            )
            .map((patientId) => getElement(state, 'patients', patientId));

    for (const category of ['red', 'yellow', 'green'] as const) {
        const patients = patientsInGeneralThreshold.filter(
            (patient) =>
                category ===
                getCateringStatus(
                    Patient.getVisibleStatus(
                        patient,
                        state.configuration.pretriageEnabled,
                        state.configuration.bluePatientsEnabled
                    )
                )
        );
        // Treat every patient, closest first, until the capacity is full
        for (const patient of patients) {
            if (
                !caterFor(
                    cateringElement,
                    catersFor,
                    patient,
                    state.configuration.pretriageEnabled,
                    state.configuration.bluePatientsEnabled
                )
            ) {
                break;
            }
        }
    }
}

function getCateringStatus(status: PatientStatus) {
    // Treat not pretriaged patients as yellow.
    return status === 'white' ? 'yellow' : status;
}
