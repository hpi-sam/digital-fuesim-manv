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

// const defaultFemaleImage: ImageProperties = {
//     url: '/assets/female-patient.svg',
//     height: 80,
//     aspectRatio: 1,
// };

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

const yellowFor2PhasesState = PatientHealthState.create(
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
            matchingHealthStateId: yellowFor2PhasesState.id,
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

const yellowUntilPhase5State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.yellowMax,
            5
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

const recoverWithRSState = PatientHealthState.create(
    FunctionParameters.create(
        0,
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.yellowMax,
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
            matchingHealthStateId: noChangesState.id,
            minimumHealth: healthPointsDefaults.greenAverage,
        },
    ]
);

const yellowUntilPhase4State = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    [
        {
            matchingHealthStateId: recoverWithRSState.id,
            earliestTime: 4 * 12 * 60 * 1000,
        },
    ]
);

const yellowStartPhase4RSDecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        )
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.redMax,
        },
    ]
);

const yellowUntilRedPhase4State = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    [
        {
            matchingHealthStateId: yellowStartPhase4RSDecisionState.id,
            earliestTime: 4 * 12 * 60 * 1000,
        },
    ]
);

const yellowStartPhase9RADecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.blackMax,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.blackMax,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.blackMax,
            1
        ),
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            minimumHealth: healthPointsDefaults.yellowAverage,
        },
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.blackMax,
        },
    ]
);

const yellowStartPhase8RADecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        0
    ),
    [
        {
            matchingHealthStateId: yellowStartPhase9RADecisionState.id,
            earliestTime: 3 * 12 * 60 * 1000,
        },
    ]
);

const yellowStartPhase7RSDecisionState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        ),
        -calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            1
        )
    ),
    [
        {
            matchingHealthStateId: yellowStartPhase8RADecisionState.id,
            earliestTime: 3 * 12 * 60 * 1000,
        },
    ]
);

const yellowFor3PhasesState = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    [
        {
            matchingHealthStateId: yellowStartPhase7RSDecisionState.id,
            earliestTime: 3 * 12 * 60 * 1000,
        },
    ]
);

const redFor2PhasesState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.yellowAverage,
            2
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: yellowFor3PhasesState.id,
            minimumHealth: healthPointsDefaults.yellowAverage,
        },
    ]
);

const yellowUntilPhase3State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowAverage,
            healthPointsDefaults.redAverage,
            2
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: redFor2PhasesState.id,
            maximumHealth: healthPointsDefaults.redAverage,
        },
    ]
);

const redUntilBlack2PhasesState = PatientHealthState.create(
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

const yellowUntilPrioRedPhase4State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.yellowMax,
            healthPointsDefaults.redAverage,
            4
        ),
        0,
        0,
        0
    ),
    [
        {
            matchingHealthStateId: redUntilBlack2PhasesState.id,
            maximumHealth: healthPointsDefaults.redAverage,
        },
    ]
);

const redUntilBlackPhase2State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.blackMax,
        },
        {
            matchingHealthStateId: noChangesState.id,
            earliestTime: 3 * 12 * 60 * 1000,
        },
    ]
);

const redInstantTransportState = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            3
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

const redIntoTransportFor2PhasesState = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    [
        {
            matchingHealthStateId: redInstantTransportState.id,
            earliestTime: 2 * 12 * 60 * 1000,
        },
    ]
);

const redUntilPhase2State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.blackMax,
        },
        {
            matchingHealthStateId: redIntoTransportFor2PhasesState.id,
            earliestTime: 3 * 12 * 60 * 1000,
        },
    ]
);

const prioRedUntilPhase2State = PatientHealthState.create(
    FunctionParameters.create(
        calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        -calculateHealthChange(
            healthPointsDefaults.redAverage,
            healthPointsDefaults.blackMax,
            2
        ),
        0
    ),
    [
        {
            matchingHealthStateId: noChangesState.id,
            maximumHealth: healthPointsDefaults.blackMax,
        },
        {
            matchingHealthStateId: redInstantTransportState.id,
            earliestTime: 3 * 12 * 60 * 1000,
        },
    ]
);

// // The amount of damage to kill an untreated patient with full health in 10 minutes
// const soonDamage = -healthPointsDefaults.greenMax / (10 * 60);

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
            defaultMaleImage,
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
            defaultMaleImage,
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
            defaultMaleImage,
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
            defaultMaleImage,
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
            defaultMaleImage,
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
                [yellowFor2PhasesState.id]: yellowFor2PhasesState,
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
            defaultMaleImage,
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
            defaultMaleImage,
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
            {
                [noChangesState.id]: noChangesState,
                [yellowUntilPhase5State.id]: yellowUntilPhase5State,
            },
            defaultMaleImage,
            healthPointsDefaults.yellowAverage,
            yellowUntilPhase5State.id
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
            {
                [noChangesState.id]: noChangesState,
                [yellowUntilPhase4State.id]: yellowUntilPhase4State,
                [recoverWithRSState.id]: recoverWithRSState,
            },
            defaultMaleImage,
            healthPointsDefaults.yellowMax,
            yellowUntilPhase4State.id
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
            {
                [noChangesState.id]: noChangesState,
                [yellowUntilRedPhase4State.id]: yellowUntilRedPhase4State,
                [yellowStartPhase4RSDecisionState.id]:
                    yellowStartPhase4RSDecisionState,
            },
            defaultMaleImage,
            healthPointsDefaults.yellowAverage,
            yellowUntilRedPhase4State.id
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
            healthPointsDefaults.yellowAverage,
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
            {
                [noChangesState.id]: noChangesState,
                [yellowUntilPhase3State.id]: yellowUntilPhase3State,
                [redFor2PhasesState.id]: redFor2PhasesState,
                [yellowFor3PhasesState.id]: yellowFor3PhasesState,
                [yellowStartPhase7RSDecisionState.id]:
                    yellowStartPhase7RSDecisionState,
                [yellowStartPhase8RADecisionState.id]:
                    yellowStartPhase8RADecisionState,
                [yellowStartPhase9RADecisionState.id]:
                    yellowStartPhase9RADecisionState,
            },
            defaultMaleImage,
            healthPointsDefaults.yellowAverage,
            yellowUntilPhase3State.id
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
            {
                [noChangesState.id]: noChangesState,
                [yellowUntilPrioRedPhase4State.id]:
                    yellowUntilPrioRedPhase4State,
                [redUntilBlack2PhasesState.id]: redUntilBlack2PhasesState,
            },
            defaultMaleImage,
            healthPointsDefaults.yellowMax,
            yellowUntilPrioRedPhase4State.id
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
            {
                [noChangesState.id]: noChangesState,
                [redUntilBlackPhase2State.id]: redUntilBlackPhase2State,
            },
            defaultMaleImage,
            healthPointsDefaults.redAverage,
            redUntilBlackPhase2State.id
        ),
        PatientTemplate.create(
            {
                sex: 'male',
                externalFeatures: '1,84 m, braune Augen, Brille, braune Haare',
                age: 15,
            },
            {
                [noChangesState.id]: noChangesState,
                [redUntilBlackPhase2State.id]: redUntilBlackPhase2State,
            },
            defaultMaleImage,
            healthPointsDefaults.redAverage,
            redUntilBlackPhase2State.id
        ),
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures:
                    '1,75 m, blonde Haare, blaue Augen, Brille, extrem adipös',
                age: 50,
            },
            {
                [noChangesState.id]: noChangesState,
                [redUntilBlackPhase2State.id]: redUntilBlackPhase2State,
            },
            defaultMaleImage,
            healthPointsDefaults.redAverage,
            redUntilBlackPhase2State.id
        ),
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: '1,72 m, braune Augen, blonde Haare',
                age: 25,
            },
            {
                [noChangesState.id]: noChangesState,
                [redUntilBlackPhase2State.id]: redUntilBlackPhase2State,
            },
            defaultMaleImage,
            healthPointsDefaults.redAverage,
            redUntilBlackPhase2State.id
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
            {
                [noChangesState.id]: noChangesState,
                [redUntilPhase2State.id]: redUntilPhase2State,
                [redIntoTransportFor2PhasesState.id]:
                    redIntoTransportFor2PhasesState,
                [redInstantTransportState.id]: redInstantTransportState,
            },
            defaultMaleImage,
            healthPointsDefaults.redAverage,
            redUntilPhase2State.id
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
            {
                [noChangesState.id]: noChangesState,
                [prioRedUntilPhase2State.id]: prioRedUntilPhase2State,
                [redInstantTransportState.id]: redInstantTransportState,
            },
            defaultMaleImage,
            healthPointsDefaults.redAverage,
            prioRedUntilPhase2State.id
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
            {
                [noChangesState.id]: noChangesState,
                [redInstantTransportState.id]: redInstantTransportState,
            },
            defaultMaleImage,
            healthPointsDefaults.redAverage,
            redInstantTransportState.id
        ),
    ]),
];
