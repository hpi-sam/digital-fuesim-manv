import type {
    Catering,
    ExerciseState,
    PatientUpdate,
} from 'digital-fuesim-manv-shared';
import { getElement, Patient } from 'digital-fuesim-manv-shared';
import { cloneDeep } from 'lodash-es';

/**
 * Apply the patient tick to the {@link state}
 * @param state The {@link ExerciseState} the patient tick should be applied on later
 * @param patientTickInterval The interval in ms between calls to this function
 * @returns An array of {@link PatientUpdate}s to apply to the {@link state} in a reducer
 */
export function patientTick(
    state: ExerciseState,
    patientTickInterval: number
): PatientUpdate[] {
    return (
        Object.values(state.patients)
            // Only look at patients that are alive and have a position, i.e. are not in a vehicle
            .filter(
                (patient) =>
                    Patient.getVisibleStatus(
                        patient,
                        state.configuration.pretriageEnabled,
                        state.configuration.bluePatientsEnabled
                    ) !== 'black' && !Patient.isInVehicle(patient)
            )
            .map((patient) => {
                // update the time a patient is being treated, to check for pretriage later
                const treatmentTime = Patient.isTreatedByPersonnel(patient)
                    ? patient.treatmentTime + patientTickInterval
                    : patient.treatmentTime;
                const newTreatment = getDedicatedResources(state, patient);
                const nextStateName = getNextStateName(
                    patient,
                    getAverageTreatment(patient.treatmentHistory, newTreatment)
                );
                const nextStateTime =
                    nextStateName === patient.currentHealthStateName
                        ? patient.stateTime +
                          patientTickInterval *
                              patient.changeSpeed *
                              state.configuration.globalPatientChangeSpeed
                        : 0;
                return {
                    id: patient.id,
                    nextStateName,
                    nextStateTime,
                    treatmentTime,
                    newTreatment,
                };
            })
    );
}

/**
 * Find catering personnel/material for a {@link patient}
 * @param state The {@link ExerciseState} to use
 * @param patient The {@link Patient} to find associated material and personnel for
 * @returns An object containing the count of assigned personnel and material that cater for the {@link patient}.
 */
function getDedicatedResources(
    state: ExerciseState,
    patient: Patient
): Catering {
    const cateringTypes: Catering = {
        notarzt: 0,
        notSan: 0,
        rettSan: 0,
        san: 0,
        gf: 0,
        material: Object.keys(patient.assignedMaterialIds).length,
    };

    // Get the number of every personnel
    Object.keys(patient.assignedPersonnelIds).forEach(
        (personnelId) =>
            cateringTypes[
                getElement(state, 'personnel', personnelId).personnelType
            ]++
    );

    return cateringTypes;
}

/**
 * Find the next {@link PatientHealthState} id for the {@link patient} by using the {@link ConditionParameters}.
 * @param patient The {@link Patient} to get the next {@link PatientHealthState} id for.
 * @returns The next {@link PatientHealthState} id.
 */
function getNextStateName(patient: Patient, dedicatedResources: Catering) {
    const currentState = patient.healthStates[patient.currentHealthStateName]!;
    for (const nextConditions of currentState.nextStateConditions) {
        if (
            (nextConditions.earliestTime === undefined ||
                patient.stateTime > nextConditions.earliestTime) &&
            (nextConditions.latestTime === undefined ||
                patient.stateTime < nextConditions.latestTime) &&
            (nextConditions.isBeingTreated === undefined ||
                Patient.isTreatedByPersonnel(patient) ===
                    nextConditions.isBeingTreated) &&
            (nextConditions.requiredMaterialAmount === undefined ||
                dedicatedResources.material >=
                    nextConditions.requiredMaterialAmount) &&
            (nextConditions.requiredNotArztAmount === undefined ||
                dedicatedResources.notarzt >=
                    nextConditions.requiredNotArztAmount) &&
            (nextConditions.requiredNotSanAmount === undefined ||
                dedicatedResources.notSan + dedicatedResources.notarzt >=
                    nextConditions.requiredNotSanAmount) &&
            (nextConditions.requiredRettSanAmount === undefined ||
                dedicatedResources.rettSan +
                    dedicatedResources.notSan +
                    dedicatedResources.notarzt >=
                    nextConditions.requiredRettSanAmount) &&
            (nextConditions.requiredSanAmount === undefined ||
                dedicatedResources.san +
                    dedicatedResources.rettSan +
                    dedicatedResources.notSan +
                    dedicatedResources.notarzt >=
                    nextConditions.requiredSanAmount)
        ) {
            return nextConditions.matchingHealthStateName;
        }
    }
    return patient.currentHealthStateName;
}

/**
 * Get the average treatment for roughly the last minute, scaled to 100% from {@link requiredPercentage}
 */
function getAverageTreatment(
    treatmentHistory: readonly Catering[],
    newTreatment: Catering,
    requiredPercentage: number = 0.8
) {
    const averageCatering: Catering = cloneDeep(newTreatment);
    treatmentHistory.forEach((catering, index) => {
        if (index === 0) {
            return;
        }
        averageCatering.gf += catering.gf;
        averageCatering.material += catering.material;
        averageCatering.notarzt += catering.notarzt;
        averageCatering.notSan += catering.notSan;
        averageCatering.rettSan += catering.rettSan;
        averageCatering.san += catering.san;
    });
    const modifier = requiredPercentage * treatmentHistory.length;
    averageCatering.gf = averageCatering.gf / modifier;
    averageCatering.material = averageCatering.material / modifier;
    averageCatering.notarzt = averageCatering.notarzt / modifier;
    averageCatering.notSan = averageCatering.notSan / modifier;
    averageCatering.rettSan = averageCatering.rettSan / modifier;
    averageCatering.san = averageCatering.san / modifier;

    return averageCatering;
}
