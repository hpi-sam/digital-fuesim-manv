import type { UUID } from '..';

// This is a heuristic and doesn't have to be 100% correct - the players don't see the healthPoints but only the color
// This function could be as complex as we want it to be (Math.sin to get something periodic, higher polynoms...)
function calculateNextHealthPoints(
    time: number,
    health: number,
    material: number,
    notarzt: number,
    notSan: number,
    retSan: number,
    phaseChangeIntervalls: Interval[]
): number {
    const functionParameters = getFunctionParameters(
        phaseChangeIntervalls,
        time
    );
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
    return Math.max(
        0,
        Math.min(
            100_000,
            // our current health points
            health +
                // e.g. each second we lose 100 health points
                functionParameters.constantChange +
                // e.g. if we have a notarzt we gain 500 additional health points per second
                functionParameters.notarzt * equippedNotarzt +
                functionParameters.notSan * equippedNotSan +
                functionParameters.retSan * equippedRetSan
        )
    );
}

interface PatientHealthState {
    id: UUID;
    functionParameters: FunctionParameters;
    /**
     * The first matching conditions are selected.
     * When nothing matches, the state is not changed.
     */
    nextStateConditions: ConditionParameters[];
}

interface FunctionParameters {
    constantChange: number;
    notarzt: number;
    retSan: number;
    notSan: number;
}

interface ConditionParameters {
    earliestTime: number | undefined;
    latestTime: number | undefined;
    minimumHealth: number | undefined;
    maximumHealth: number | undefined;
    isBeingTreated: boolean | undefined;
    /**
     * The state to switch to when the conditions match
     */
    matchingHealthStateId: UUID;
}
