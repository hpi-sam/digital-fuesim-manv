import {
    FunctionParameters,
    PatientHealthState,
    PatientTemplate,
} from '../../models';
import { PatientCategory } from '../../models/patient-category';
import type { ImageProperties } from '../../models/utils';
import { healthPointsDefaults } from '../../models/utils';

const defaultMaleImage: ImageProperties = {
    url: '/assets/male-patient.svg',
    height: 80,
    aspectRatio: 1,
};

const defaultFemaleImage: ImageProperties = {
    url: '/assets/female-patient.svg',
    height: 80,
    aspectRatio: 1,
};

// returns the change needed to reach the targetHealth from startHealth in the time of phases
function calculateHealthChange(
    starthealth: number,
    targetHealth: number,
    phases: number
) {
    return (targetHealth - starthealth) / (phases * 12 * 60);
}

const noChangesState = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    []
);

const yellowToGreenState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenAverage,
            1
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            minimumHealth: healthPointsDefaults.greenAverage,
        },
    ]
);

const waitForYellowToGreenState = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    [
        {
            matchingHealthStateId: yellowToGreenState.id,
            earliestTime: 7 * 60 * 1000,
        },
    ]
);

const recoverToGreenState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenAverage,
            3
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenAverage,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenAverage,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenAverage,
            1
        )
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            minimumHealth: healthPointsDefaults.greenAverage,
        },
    ]
);

const yellowFor2Phases = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    [
        {
            matchingHealthStateId: recoverToGreenState.id,
            earliestTime: 2 * 12 * 60 * 1000,
        },
    ]
);

const greenStartPhase11RADecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.blackMax,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.redMax,
            healthPointsDefaults.greenMax,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.redMax,
            healthPointsDefaults.greenMax,
            1
        ),
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            minimumHealth: healthPointsDefaults.greenAverage,
        },
    ]
);

const greenStartPhase10RADecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenMax,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenMax,
            1
        ),
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            minimumHealth: healthPointsDefaults.greenMax,
        },
        {
            matchingHealthStateId: greenStartPhase11RADecisionState.id,
            earliestTime: 12 * 60 * 1000,
        },
    ]
);

const greenStartPhase9RSDecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.greenAverage,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.yellowMax,
            1
        ),
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.yellowMax,
            1
        )
    ),
    [
        {
            matchingHealthStateId: greenStartPhase10RADecisionState.id,
            earliestTime: 12 * 60 * 1000,
        },
    ]
);

const waitForTransportState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.blackMax,
        },
    ]
);

const greenStartPhase5RADecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            1
        ),
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.blackMax,
        },
        {
            matchingHealthStateId: waitForTransportState.id,
            earliestTime: 4 * 12 * 60 * 1000,
        },
    ]
);

const yellowToRedState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: greenStartPhase5RADecisionState.id,
            maximumHealth: healthPointsDefaults.redAverage,
        },
    ]
);

const greenUntilPhase2State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            2
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: yellowFor2Phases.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const greenUntilPhase4State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            4
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: yellowToRedState.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const greenUntilPhase7State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            7
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: waitForYellowToGreenState.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const greenUntilPhase8State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            8
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: waitForYellowToGreenState.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const greenUntilPhase9State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            9
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: greenStartPhase9RSDecisionState.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const greenUntilPhase10State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            10
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const greenUntilPhase11State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            11
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const greenUntilPhase12State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.greenMax,
            healthPointsDefaults.yellowAverage,
            12
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

// // The amount of damage to kill an untreated patient with full health in 10 minutes
// const soonDamage = -healthPointsDefaults.greenMax / (10 * 60);
// const needsNotarztSoonState = PatientHealthState.create(
//     FunctionParameters.create(
//         soonDamage,
//         -soonDamage * 2,
//         -soonDamage,
//         -soonDamage / 2
//     ),
//     []
// );

// const needsSomeoneSoonGreenState = PatientHealthState.create(
//     FunctionParameters.create(
//         soonDamageUntilYellow,
//         -soonDamageUntilYellow,
//         -soonDamageUntilYellow,
//         -soonDamageUntilYellow
//     ),
//     [
//         {
//             matchingHealthStateId: stableState.id,
//             maximumHealth: healthPointsDefaults.yellowMax,
//         },
//     ]
// );

// const needsSomeoneLaterState2 = needsSomeoneSoonState;

// const needsSomeoneLaterState1 = PatientHealthState.create(
//     FunctionParameters.create(0, 0, 0, 0),
//     [
//         {
//             earliestTime: 5 * 60 * 1000,
//             matchingHealthStateId: needsSomeoneLaterState2.id,
//         },
//     ]
// );

export const defaultPatientCategories: readonly PatientCategory[] = [
    // XAXAXA Patients
    PatientCategory.create('XAXAXA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: 'blaue Augen, rothaarig, 1,69 m',
                age: 16,
            },
            { [noChangesState.id]: noChangesState },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // XAXAXD Patients
    PatientCategory.create('XAXAXD', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: 'braune Haare, braune Augen, 1,72 m',
                age: 35,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase10State.id]: greenUntilPhase10State,
            },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase10State.id
        ),
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: '1,89 m, Vollbart, blond, blauäugig',
                age: 25,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase11State.id]: greenUntilPhase10State,
            },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase11State.id
        ),
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: '1,76m, hellblond, blaue Augen, Brille',
                age: 35,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase12State.id]: greenUntilPhase10State,
            },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase12State.id
        ),
    ]),

    // XAXDXA Patients
    PatientCategory.create('XAXDXA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: 'braune Haare, braune Augen, 1,79 m, adipös',
                age: 50,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase7State.id]: greenUntilPhase7State,
                [waitForYellowToGreenState.id]: waitForYellowToGreenState,
                [yellowToGreenState.id]: yellowToGreenState,
            },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase7State.id
        ),
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: '1,59 m, blaue Augen, graue Haare',
                age: 65,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase8State.id]: greenUntilPhase8State,
                [waitForYellowToGreenState.id]: waitForYellowToGreenState,
                [yellowToGreenState.id]: yellowToGreenState,
            },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase8State.id
        ),
    ]),

    // XDXDXA Patients
    PatientCategory.create('XDXDXA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures:
                    'Spitzbart, blaue Augen, blonde Haare, 182 cm',
                age: 52,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase2State.id]: greenUntilPhase2State,
                [yellowFor2Phases.id]: yellowFor2Phases,
                [recoverToGreenState.id]: recoverToGreenState,
            },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase2State.id
        ),
    ]),

    // XAXAYB Patients
    PatientCategory.create('XAXAYB', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: '1,66 m, blond, blaue Augen',
                age: 30,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase9State.id]: greenUntilPhase9State,
                [greenStartPhase9RSDecisionState.id]:
                    greenStartPhase9RSDecisionState,
                [greenStartPhase10RADecisionState.id]:
                    greenStartPhase10RADecisionState,
                [greenStartPhase11RADecisionState.id]:
                    greenStartPhase11RADecisionState,
            },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase9State.id
        ),
    ]),

    // XDZBZC Patients
    PatientCategory.create('XDZBZC', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: 'graue Haare, blaue Augen, 1,69 m, Brille',
                age: 76,
            },
            {
                [noChangesState.id]: noChangesState,
                [greenUntilPhase4State.id]: greenUntilPhase4State,
                [yellowToRedState.id]: yellowToRedState,
                [greenStartPhase5RADecisionState.id]:
                    greenStartPhase5RADecisionState,
                [waitForTransportState.id]: waitForTransportState,
            },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            greenUntilPhase4State.id
        ),
    ]),

    // YAXAXA Patients
    PatientCategory.create('YAXAXA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures:
                    'dunkle Haare, braune Augen, Muttermal Stirn, 165 cm',
                age: 14,
            },
            { [noChangesState.id]: noChangesState },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // YBXAXA Patients
    PatientCategory.create('YBXAXA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: 'blaue Augen, weiße Haare, 174 cm',
                age: 72,
            },
            { [noChangesState.id]: noChangesState },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // YBYAYA Patients
    PatientCategory.create('YBYAYA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: 'Vollbart, blond, blaue Augen, 1,87 m',
                age: 55,
            },
            { [noChangesState.id]: noChangesState },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // YAYBYA Patients
    PatientCategory.create('YAYBYA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: 'Glatze, graublaue Augen, Brille, 174 cm',
                age: 57,
            },
            { [noChangesState.id]: noChangesState },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // YDYBYB Patients
    PatientCategory.create('YDYBYB', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures:
                    'graue Haare, Brille, braune Augen, ca. 1,70 m',
                age: 71,
            },
            { [noChangesState.id]: noChangesState },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // YCZCVE Patients
    PatientCategory.create('YCZCVE', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures:
                    'grüne Augen, grauhaarig, 1,68 m, adipös, Brille',
                age: 51,
            },
            { [noChangesState.id]: noChangesState },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // ZBZAZA Patients
    PatientCategory.create('ZBZAZA', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: '1,86 m, Glatze, braune Augen, Brille',
                age: 60,
            },
            { [noChangesState.id]: noChangesState },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: '1,84 m, braune Augen, Brille, braune Haare',
                age: 15,
            },
            { [noChangesState.id]: noChangesState },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures:
                    '1,75 m, blonde Haare, blaue Augen, Brille, extrem adipös',
                age: 50,
            },
            { [noChangesState.id]: noChangesState },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: '1,72 m, braune Augen, blonde Haare',
                age: 25,
            },
            { [noChangesState.id]: noChangesState },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // ZBZCVE Patients
    PatientCategory.create('ZBZCVE', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures:
                    'graue Haare, Brille, grüne Augen, ca. 1,60 m',
                age: 80,
            },
            { [noChangesState.id]: noChangesState },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // ZCZCVE Patients
    PatientCategory.create('ZCZCVE', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: '1,78m, Bart, schwarzhaarig, braune Augen',
                age: 50,
            },
            { [noChangesState.id]: noChangesState },
            defaultMaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),

    // ZCVEVE Patients
    PatientCategory.create('ZCVEVE', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: '1,64 m, blaue Augen, blond',
                age: 55,
            },
            { [noChangesState.id]: noChangesState },
            defaultFemaleImage,
            healthPointsDefaults.greenMax,
            noChangesState.id
        ),
    ]),
];
