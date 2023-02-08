import { groupBy } from 'lodash-es';
import type { Material, Personnel } from '../../../models';
import { Patient } from '../../../models';
import type { MapCoordinates, PatientStatus } from '../../../models/utils';
import {
    currentCoordinatesOf,
    isNotOnMap,
    isInSimulatedRegion,
} from '../../../models/utils';
import { SpatialTree } from '../../../models/utils/spatial-tree';
import type { ExerciseState } from '../../../state';
import { maxTreatmentRange } from '../../../state-helpers/max-treatment-range';
import type { Mutable, UUID } from '../../../utils';
import { elementTypePluralMap } from '../../../utils/element-type-plural-map';
import { getElement } from './get-element';

// TODO: `caterFor` and `treat` are currently used as synonyms without a clear distinction.

/**
 * How many patients of which triageStatus a personnel/material is treating
 */
interface CatersFor {
    red: number;
    yellow: number;
    green: number;
}

/**
 * @returns whether a material or personnel could treat a patient with {@link status} if it already {@link catersFor} patients
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
        const numberOfTreatedCategories = Object.entries(catersFor).filter(
            ([category, catersForInCategory]) =>
                // Will be treated
                status === category ||
                // Is already treated
                catersForInCategory > 0
        ).length;
        return (
            // Only one category can be treated
            numberOfTreatedCategories <= 1 &&
            // + 1 for the patient that will be treated
            catersFor[status] + 1 <= cateringElement.canCaterFor[status]
        );
    }

    let availableCapacity = 0;
    for (const category of ['red', 'yellow', 'green'] as const) {
        // The catering capacity is calculated cumulatively - a red slot can also treat a yellow or green one instead
        availableCapacity +=
            cateringElement.canCaterFor[category] -
            catersFor[category] -
            (status === category ? 1 : 0);
        if (availableCapacity < 0) {
            return false;
        }
    }
    return true;
}

/**
 * Tries to assign the {@link patient} to {@link cateringElement} (side effect).
 * @returns Whether the patient can be catered for by the {@link cateringElement}.
 */
function tryToCaterFor(
    cateringElement: Mutable<Material | Personnel>,
    catersFor: Mutable<CatersFor>,
    patient: Mutable<Patient>,
    pretriageEnabled: boolean,
    bluePatientsEnabled: boolean
) {
    const status = getCateringStatus(
        Patient.getVisibleStatus(patient, pretriageEnabled, bluePatientsEnabled)
    );

    if (!couldCaterFor(status, cateringElement, catersFor)) {
        return false;
    }

    cateringElement.assignedPatientIds[patient.id] = true;

    if (cateringElement.type === 'personnel') {
        patient.assignedPersonnelIds[cateringElement.id] = true;
    } else {
        patient.assignedMaterialIds[cateringElement.id] = true;
    }

    catersFor[status as 'green' | 'red' | 'yellow']++;
    return true;
}

/**
 * @param position of the patient where all elements of {@link elementType} should be recalculated
 * @param elementIdsToBeSkipped the elements whose treatment should not be updated
 */
function updateCateringAroundPatient(
    state: Mutable<ExerciseState>,
    position: MapCoordinates,
    elementType: 'material' | 'personnel',
    elementIdsToBeSkipped: Set<UUID>
) {
    const elementsInTreatmentRange = SpatialTree.findAllElementsInCircle(
        state.spatialTrees[elementTypePluralMap[elementType]],
        position,
        maxTreatmentRange
    ).filter((elementId) => !elementIdsToBeSkipped.has(elementId));

    for (const elementId of elementsInTreatmentRange) {
        updateCatering(state, getElement(state, elementType, elementId));
    }
}

export function removeTreatmentsOfElement(
    state: Mutable<ExerciseState>,
    element: Mutable<Material | Patient | Personnel>
) {
    if (element.type === 'patient') {
        const patient = element;
        // Make all personnel stop treating this patient
        for (const personnelId of Object.keys(patient.assignedPersonnelIds)) {
            const personnel = getElement(state, 'personnel', personnelId);
            delete personnel.assignedPatientIds[patient.id];
        }
        patient.assignedPersonnelIds = {};
        // Make all material stop treating this patient
        for (const materialId of Object.keys(patient.assignedMaterialIds)) {
            const material = getElement(state, 'material', materialId);
            delete material.assignedPatientIds[patient.id];
        }
        patient.assignedMaterialIds = {};
    } else if (element.type === 'personnel') {
        const personnel = element;
        // This personnel doesn't treat any patients anymore
        for (const patientId of Object.keys(personnel.assignedPatientIds)) {
            const patient = getElement(state, 'patient', patientId);
            delete patient.assignedPersonnelIds[personnel.id];
        }
        personnel.assignedPatientIds = {};
    } else if (element.type === 'material') {
        const material = element;
        // This material doesn't treat any patients anymore
        for (const patientId of Object.keys(material.assignedPatientIds)) {
            const patient = getElement(state, 'patient', patientId);
            delete patient.assignedMaterialIds[material.id];
        }
        material.assignedPatientIds = {};
    }
}

/**
 * @param element.position is important:
 *     - if an element was moved: {@link element.position} must be the new position
 *     - if treatment of an element should be removed: set {@link element.position} to `undefined`
 * Also sets {@link Patient.visibleStatusChanged} back to `false` (if element is a patient)
 */
export function updateTreatments(
    state: Mutable<ExerciseState>,
    element: Mutable<Material | Patient | Personnel>
) {
    // The requirement of this function is not to result in a "perfect" treatment pattern.
    // Instead, it should just find an intuitive and reasonably realistic treatment pattern.
    // Currently, the treatment pattern algorithm is stable. This means that completely done from scratch,
    // the result would semantically be the same. This could be changed later.

    if (isInSimulatedRegion(element)) {
        return;
    }

    if (isNotOnMap(element)) {
        removeTreatmentsOfElement(state, element);
        return;
    }

    if (element.type === 'personnel' || element.type === 'material') {
        updateCatering(state, element);
        return;
    }

    // Used to save all elements that already have an updated treatment calculation - therefore don't need it to be calculated again
    const alreadyUpdatedElementIds = new Set<UUID>();
    // Update every personnel and material that was assigned to the patient
    for (const personnelId of Object.keys(element.assignedPersonnelIds)) {
        updateCatering(state, getElement(state, 'personnel', personnelId));
        // Saving personnelIds of personnel that already got calculated - makes small movements of patients more efficient
        alreadyUpdatedElementIds.add(personnelId);
    }
    for (const materialId of Object.keys(element.assignedMaterialIds)) {
        updateCatering(state, getElement(state, 'material', materialId));
        // Saving materialIds of material that already got calculated - makes small movements of patients more efficient
        alreadyUpdatedElementIds.add(materialId);
    }

    updateCateringAroundPatient(
        state,
        currentCoordinatesOf(element),
        'personnel',
        alreadyUpdatedElementIds
    );
    updateCateringAroundPatient(
        state,
        currentCoordinatesOf(element),
        'material',
        alreadyUpdatedElementIds
    );
    // The treatment of the patient has just been updated -> hence the visible status hasn't been changed since the last update
    element.visibleStatusChanged = false;
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
        // The element is no longer in a position to treat a patient on the map
        isNotOnMap(cateringElement)
    ) {
        return;
    }

    const catersFor: CatersFor = {
        red: 0,
        yellow: 0,
        green: 0,
    };

    // Patients that got already treated (or tried to be treated) in overrideTreatmentRange
    // should not be treated (or tried to be treated) again in treatmentRange
    const cateredForPatients = new Set<UUID>();

    if (cateringElement.overrideTreatmentRange > 0) {
        const patientIdsInOverrideRange = SpatialTree.findAllElementsInCircle(
            state.spatialTrees.patients,
            currentCoordinatesOf(cateringElement),
            cateringElement.overrideTreatmentRange
        );
        // In the overrideTreatmentRange (the override circle) only the distance to the patient is important - his/her injuries are ignored
        for (const patientId of patientIdsInOverrideRange) {
            tryToCaterFor(
                cateringElement,
                catersFor,
                getElement(state, 'patient', patientId),
                state.configuration.pretriageEnabled,
                state.configuration.bluePatientsEnabled
            );
            cateredForPatients.add(patientId);
        }
    }

    if (
        cateringElement.treatmentRange === 0 ||
        // Only look for more patients to treat, if there still is capacity (performance improvement)
        (!couldCaterFor('red', cateringElement, catersFor) &&
            !couldCaterFor('yellow', cateringElement, catersFor) &&
            !couldCaterFor('green', cateringElement, catersFor))
    ) {
        return;
    }

    const patientsInTreatmentRange: Mutable<Patient>[] =
        SpatialTree.findAllElementsInCircle(
            state.spatialTrees.patients,
            currentCoordinatesOf(cateringElement),
            cateringElement.treatmentRange
        )
            // Filter out every patient in the overrideTreatmentRange
            .filter((patientId) => !cateredForPatients.has(patientId))
            .map((patientId) => getElement(state, 'patient', patientId));

    const patientsPerStatus = groupBy(patientsInTreatmentRange, (patient) =>
        getCateringStatus(
            Patient.getVisibleStatus(
                patient,
                state.configuration.pretriageEnabled,
                state.configuration.bluePatientsEnabled
            )
        )
    );
    for (const status of ['red', 'yellow', 'green'] as const) {
        // Treat every patient, closest first, until the capacity (of this category) is full
        for (const patient of patientsPerStatus[status] ?? []) {
            if (
                !tryToCaterFor(
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
