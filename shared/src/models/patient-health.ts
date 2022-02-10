import type { Patient } from '.';

const patientTickInterval = 1000;

function patientTick() {
    // get how many & which personell & material is dedicated to each patient
    // and set patient.isBeingTreated
    for (const patient of patients) {
        updatePatientHealthPoints(patient, ...getDedicatedResources(patient));
        patient.stateTime += patientTickInterval * patient.timeSpeed;
        const nextStateId = getNextStateId(patient);
        if (nextStateId !== patient.currentHealthStateId) {
            patient.currentHealthStateId = nextStateId;
            patient.stateTime = 0;
        }
    }
}

// This is a heuristic and doesn't have to be 100% correct - the players don't see the healthPoints but only the color
// This function could be as complex as we want it to be (Math.sin to get something periodic, higher polynoms...)
// should be called every patientTickInterval
function updatePatientHealthPoints(
    patient: Patient,
    material: number,
    notarzt: number,
    notSan: number,
    retSan: number
) {
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

    patient.health = Math.max(
        0,
        Math.min(
            100_000,
            // our current health points
            patient.health +
                (changedHealthPerSecond / patientTickInterval) *
                    patient.timeSpeed
        )
    );
}

function getNextStateId(patient: Patient) {
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

/**
 * 1. The real time
 * 2. The exerciseTime
 *     - a `tick()` is (via best effort) called every >=`interval`, each `tick()` the exerciseTime is increased by `interval`
 *     - `interval` should be a mostly independent parameter from the `exerciseTime`.
 *        It should be chosen based on the server performance and resembles the
 *        worst case (a condition in `tick()` changes directly after `tick()` has been called)
 *           (Example: `interval = 20; tick` is called at `1000`, the condition changes immediately after `1000`),
 *        best case (`tick()` is called directly after `interval`, without delay) theoretical reaction time of the server.
 *     - the exerciseTime starts by 0
 *     - it can be paused and resumed
 * 3. Patient.stateTime
 *     - starts by 0 when the patient is added or has a new currentHealthStateId
 *     - every `patientTick()` the Patient.stateTime is increased by `patient.timeSpeed * patientTickInterval` (independent tick functions for vehicles, patients, etc.)
 */
