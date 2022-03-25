import type {
    ExerciseState,
    HealthPoints,
    Immutable,
    Patient,
    PersonellType,
    UUID,
} from 'digital-fuesim-manv-shared';
import { healthPointsDefaults, isAlive } from 'digital-fuesim-manv-shared';

/**
 * The count of assigned personnel and material that cater for a {@link Patient}.
 */
type Catering = { [key in PersonellType | 'material']: number };

interface PatientTickResult {
    /**
     * The id of the patient
     */
    id: UUID;
    /**
     * The new {@link HealthPoints} the patient should have
     */
    nextHealthPoints: HealthPoints;
    /**
     * The next {@link PatientHealthState} the patient should be in
     */
    nextStateId: UUID;
    /**
     * The new state time of the patient
     */
    nextStateTime: number;
}

/**
 * Apply the patient tick to the {@link state}
 * @param state The {@link ExerciseState} the patient tick should be applied on later
 * @param patientTickInterval The interval in ms between calls to this function
 * @returns An array of {@link PatientTickResult}s to apply to the {@link state} in a reducer
 */
export function patientTick(
    state: ExerciseState,
    patientTickInterval: number
): PatientTickResult[] {
    return Object.values(state.patients)
        .filter((patient) => isAlive(patient.health))
        .map((patient) => {
            const nextHealthPoints = getNextPatientHealthPoints(
                patient,
                getDedicatedResources(state, patient),
                patientTickInterval
            );
            const nextStateId = getNextStateId(patient);
            const nextStateTime =
                nextStateId === patient.currentHealthStateId
                    ? patient.stateTime +
                      patientTickInterval * patient.timeSpeed
                    : 0;
            return {
                id: patient.id,
                nextHealthPoints,
                nextStateId,
                nextStateTime,
            };
        });
}

/**
 * Find catering personnel/material for a {@link patient}
 * @param state The {@link ExerciseState} to use
 * @param patient The {@link Patient} to find associated material and personnel for
 * @returns An object containing the count of assigned personnel and material that cater for the {@link patient}.
 */
function getDedicatedResources(
    state: ExerciseState,
    patient: Immutable<Patient>
): Catering {
    if (!patient.isBeingTreated) {
        return {
            firefighter: 0,
            material: 0,
            notarzt: 0,
            notSan: 0,
            retSan: 0,
        };
    }
    const material = Object.values(state.materials).filter((thisMaterial) =>
        Object.keys(thisMaterial.assignedPatientIds).includes(patient.id)
    ).length;
    const treatingPersonnel = Object.values(state.personell).filter(
        (thisPersonnel) =>
            Object.keys(thisPersonnel.assignedPatientIds).includes(patient.id)
    );
    const notarzt = treatingPersonnel.filter(
        (thisPersonnel) => thisPersonnel.personellType === 'notarzt'
    ).length;
    const notSan = treatingPersonnel.filter(
        (thisPersonnel) => thisPersonnel.personellType === 'notSan'
    ).length;
    const retSan = treatingPersonnel.filter(
        (thisPersonnel) => thisPersonnel.personellType === 'retSan'
    ).length;
    return {
        firefighter: 0,
        material,
        notarzt,
        notSan,
        retSan,
    };
}

/**
 * Calculate the next {@link HealthPoints} for the {@link patient}.
 * @param patient The {@link Patient} to calculate the {@link HealthPoints} for.
 * @param treatedBy The count of personnel/material catering for the {@link patient}.
 * @param patientTickInterval The time in ms between calls to this function.
 * @returns The next {@link HealthPoints} for the {@link patient}
 */
// This is a heuristic and doesn't have to be 100% correct - the players don't see the healthPoints but only the color
// This function could be as complex as we want it to be (Math.sin to get something periodic, higher polynoms...)
function getNextPatientHealthPoints(
    patient: Immutable<Patient>,
    treatedBy: Catering,
    patientTickInterval: number
): HealthPoints {
    let material = treatedBy.material;
    const notarzt = treatedBy.notarzt;
    const notSan = treatedBy.notSan;
    const retSan = treatedBy.retSan;
    const functionParameters =
        patient.healthStates[patient.currentHealthStateId].functionParameters;
    // To do anything the personnel needs material
    // TODO: But a personnel should probably be able to treat a patient a bit without material - e.g. free airways, just press something on a strongly bleeding wound, etc.
    // -> find a better heuristic
    let equippedNotarzt = Math.min(notarzt, material);
    material = Math.max(material - equippedNotarzt, 0);
    let equippedNotSan = Math.min(notSan, material);
    material = Math.max(material - equippedNotSan, 0);
    let equippedRetSan = Math.min(retSan, material);
    // much more notarzt != much better patient
    equippedNotarzt = Math.log2(equippedNotarzt + 1);
    equippedNotSan = Math.log2(equippedNotSan + 1);
    equippedRetSan = Math.log2(equippedRetSan + 1);
    // TODO: some more heuristic precalculations ...
    // e.g. each second we lose 100 health points
    const changedHealthPerSecond =
        functionParameters.constantChange +
        // e.g. if we have a notarzt we gain 500 additional health points per second
        functionParameters.notarztModifier * equippedNotarzt +
        functionParameters.notSanModifier * equippedNotSan +
        functionParameters.retSanModifier * equippedRetSan;

    return Math.max(
        healthPointsDefaults.min,
        Math.min(
            healthPointsDefaults.max,
            // our current health points
            patient.health +
                (changedHealthPerSecond / 1000) *
                    patientTickInterval *
                    patient.timeSpeed
        )
    );
}

/**
 * Find the next {@link PatientHealthState} id for the {@link patient} by using the {@link ConditionParameters}.
 * @param patient The {@link Patient} to get the next {@link PatientHealthState} id for.
 * @returns The next {@link PatientHealthState} id.
 */
function getNextStateId(patient: Immutable<Patient>) {
    const currentState = patient.healthStates[patient.currentHealthStateId];
    for (const nextConditions of currentState.nextStateConditions) {
        if (
            (nextConditions.earliestTime === undefined ||
                patient.stateTime > nextConditions.earliestTime) &&
            (nextConditions.latestTime === undefined ||
                patient.stateTime < nextConditions.latestTime) &&
            (nextConditions.minimumHealth === undefined ||
                patient.health > nextConditions.minimumHealth) &&
            (nextConditions.maximumHealth === undefined ||
                patient.health < nextConditions.maximumHealth) &&
            (nextConditions.isBeingTreated === undefined ||
                patient.isBeingTreated === nextConditions.isBeingTreated)
        ) {
            return nextConditions.matchingHealthStateId;
        }
    }
    return patient.currentHealthStateId;
}
