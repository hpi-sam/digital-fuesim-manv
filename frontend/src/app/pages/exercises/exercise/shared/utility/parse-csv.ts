import type {
    ConditionParameters,
    ImageProperties,
} from 'digital-fuesim-manv-shared';
import {
    Breathing,
    Circulation,
    Disability,
    Exposure,
    PatientHealthState,
    PretriageInformation,
    BiometricInformation,
    PatientTemplate,
} from 'digital-fuesim-manv-shared';

export interface PatientData {
    code: string;
    templates: PatientTemplate[];
}
const defaultImage: ImageProperties = {
    url: '/assets/male-patient.svg',
    height: 80,
    aspectRatio: 1,
};

export function parsePatientData(importString: string) {
    const patientData: PatientData[] = [];

    const splitString = importString.split('|');
    // first 106 entries are the headers
    for (let i = 106; i + 100 < splitString.length; i += 106) {
        // 0, 1, 2 are orginasational data for anaolg training
        // 3 and 4 are personalInformation that will be randomly generated
        const biometricInformation = BiometricInformation.create(
            splitString[i + 7]!,
            Number(splitString[i + 5]),
            splitString[i + 6] === 'M'
                ? 'male'
                : splitString[i + 6] === 'F'
                ? 'female'
                : 'diverse'
        );

        // 8, 9 are more organisational data
        const pretriageInformation = PretriageInformation.create(
            splitString[i + 28]!,
            splitString[i + 29]! + splitString[i + 30]!,
            !(splitString[i + 56] === 'G'),
            // XABCDE
            splitString[i + 10]! + splitString[i + 11]!,
            splitString[i + 12]!,
            Breathing.create(
                splitString[i + 13]!,
                splitString[i + 14]!,
                splitString[i + 15]!
            ),
            Circulation.create(
                splitString[i + 16]!,
                splitString[i + 17]!,
                splitString[i + 18]!,
                splitString[i + 19]!
            ),
            Disability.create(
                splitString[i + 20]!,
                splitString[i + 21]!,
                splitString[i + 22]!,
                splitString[i + 23]!,
                splitString[i + 24]!,
                splitString[i + 27]!
            ),
            Exposure.create(splitString[i + 25]!, splitString[i + 26]!)
        );

        // 31 - 55 are data for images. These are currently ignored

        const statusCode =
            splitString[i + 61]! +
            splitString[i + 62]! +
            splitString[i + 63]! +
            splitString[i + 64]! +
            splitString[i + 65]! +
            splitString[i + 66]!;

        const healthStates = generateHealthStates(
            splitString.slice(i + 67, i + 104),
            pretriageInformation
        );

        const patientTemplate = PatientTemplate.create(
            biometricInformation,
            healthStates,
            defaultImage,
            'Phase1State'
        );

        const currentCategory = patientData.find(
            (data) => data.code === statusCode
        );

        if (!currentCategory) {
            patientData.push({
                code: statusCode,
                templates: [patientTemplate],
            });
        } else {
            currentCategory.templates.push(patientTemplate);
        }
    }

    return patientData;
}

type ColorCategory = 'black' | 'blue' | 'green' | 'red' | 'yellow';
class HealthStateData {
    public name: string;
    public status: ColorCategory;
    public conditions: ConditionParameters[];
    public startingPhase: number;
    public finished: boolean;

    constructor(
        name: string,
        status: ColorCategory,
        conditions: ConditionParameters[],
        startingPhase: number,
        finished: boolean
    ) {
        this.name = name;
        this.status = status;
        this.conditions = conditions;
        this.startingPhase = startingPhase;
        this.finished = finished;
    }
}

function generateHealthStates(
    healthStateInformation: string[],
    pretriageInformation: PretriageInformation
) {
    const phaseTime = 12 * 60 * 1000;
    const phaseChanges = 11;
    const colorRegExp = /grün|gelb|rot|schwarz|blau/u;

    const healthStates: {
        [stateId: string]: PatientHealthState;
    } = {};

    const healthStateData: HealthStateData[] = [
        new HealthStateData(
            'Phase1State',
            getColor(healthStateInformation[0]!),
            [],
            1,
            false
        ),
    ];

    if (healthStateInformation.toString().includes('schwarz')) {
        healthStateData.push(
            new HealthStateData('BlackState', 'black', [], 0, true)
        );
    }

    for (let i = 0; i < phaseChanges; i++) {
        const conditionColor = colorRegExp.exec(
            healthStateInformation[3 * i + 2]!
        );
        const nextPhaseColor = getColor(healthStateInformation[3 * i + 3]!);
        // Finish all States and transfer them to two new states based on the condition
        if (conditionColor!) {
            const conditionSuccessStateName = createHealthState(
                nextPhaseColor,
                i + 2,
                healthStateData
            );
            const conditionFailureStateName = createHealthState(
                conditionColor[0] as ColorCategory,
                i + 2,
                healthStateData
            );
            healthStateData.forEach((healthState) => {
                if (healthState.finished) {
                    return;
                }
                healthState.conditions.push(
                    getCondition(
                        healthStateInformation[3 * i + 1]!,
                        (i + 1 - healthState.startingPhase) * phaseTime,
                        conditionSuccessStateName
                    ),
                    {
                        earliestTime:
                            (i + 1 - healthState.startingPhase) * phaseTime,
                        matchingHealthStateId: conditionFailureStateName,
                    }
                );
                healthState.finished = true;
            });
        }
        // There are no conditions -> Finish all states with a different color compared to the color of the next phase
        else {
            const finishedHealthStateData = healthStateData.filter(
                (healthState) =>
                    !healthState.finished &&
                    healthState.status !== nextPhaseColor
            );
            if (finishedHealthStateData.length > 0) {
                const newHealthstateName = createHealthState(
                    nextPhaseColor,
                    i + 2,
                    healthStateData
                );
                finishedHealthStateData.forEach((healthState) => {
                    healthState.conditions.push({
                        earliestTime:
                            (i + 1 - healthState.startingPhase) * phaseTime,
                        matchingHealthStateId: newHealthstateName,
                    });
                    healthState.finished = true;
                });
            }
        }
    }

    healthStateData.forEach((healthState) => {
        healthStates[healthState.name] = PatientHealthState.create(
            healthState.name,
            pretriageInformation,
            healthState.status,
            healthState.conditions
        );
    });
    return healthStates;
}

function getColor(colorString: string) {
    if (colorString === '') {
        return 'black';
    }
    const colorRegExp = /grün|gelb|rot|schwarz|blau/u;
    const color = colorRegExp.exec(colorString.toLowerCase());
    if (!color!) {
        throw new Error('Wrong color format in SK entries');
    }
    return color[0] as ColorCategory;
}

function getCondition(
    conditionString: string,
    time: number,
    healthstateName: string
) {
    const conditionRegExp = /NotArzt|NotSan|RettSan|RettH|ABTRANSPORTIERT/u;
    const condition = conditionRegExp.exec(conditionString);
    if (condition!) {
        switch (condition[0]) {
            case 'NotArzt':
                return {
                    earliestTime: time,
                    requiredNotArztAmount: 1,
                    matchingHealthStateId: healthstateName,
                };
            case 'NotSan':
                return {
                    earliestTime: time,
                    requiredNotSanAmount: 1,
                    matchingHealthStateId: healthstateName,
                };
            case 'RettSan':
                return {
                    earliestTime: time,
                    requiredRettSanAmount: 1,
                    matchingHealthStateId: healthstateName,
                };
            case 'RettH':
                return {
                    earliestTime: time,
                    requiredSanAmount: 1,
                    matchingHealthStateId: healthstateName,
                };
            default:
                // TODO: We want to ignore some cases (like Abtransportiert). This works for now but can probably be improved
                return { latestTime: -1, matchingHealthStateId: 'Phase1State' };
        }
    }
    throw new Error('Wrong condition format in SK entries');
}

/**
 * Creates a new State in healthStateData if possible and returns the id of that state
 */
function createHealthState(
    color: ColorCategory,
    currentPhase: number,
    healthStateData: HealthStateData[]
) {
    let stateName = 'BlackState';
    if (color !== 'black') {
        stateName = `Phase${currentPhase}${color}State`;
        healthStateData.push(
            new HealthStateData(stateName, color, [], currentPhase, false)
        );
    }
    return stateName;
}
