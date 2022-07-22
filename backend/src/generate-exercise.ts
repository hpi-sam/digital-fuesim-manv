import type { Mutable, ExerciseIds } from 'digital-fuesim-manv-shared';
import {
    Patient,
    cloneDeepMutable,
    BiometricInformation,
    PatientStatusCode,
    PatientHealthState,
    FunctionParameters,
    ImageProperties,
    healthPointsDefaults,
    Position,
    Viewport,
    Size,
    AutomatedViewportConfig,
    uuid,
    createVehicleParameters,
    StateExport,
} from 'digital-fuesim-manv-shared';
import { Config } from './config';
import { createNewDataSource } from './database/data-source';
import { DatabaseService } from './database/services/database-service';
import { UserReadableIdGenerator } from './utils/user-readable-id-generator';
import { ExerciseWrapper } from './exercise/exercise-wrapper';

function repeat(count: number, callback: (iteration: number) => void) {
    for (let i = 0; i < count; i++) {
        callback(i);
    }
}

type PatientWithoutId = Omit<Mutable<Patient>, 'id'>;
interface Patients {
    walkable: PatientWithoutId;
    nonWalkable: PatientWithoutId;
}
function getPatients(): { green: Patients; yellow: Patients; red: Patients } {
    const greenWalkablePatient = cloneDeepMutable(
        Patient.create(
            { address: 'Some Street 1', birthdate: 'Today', name: 'Some Name' },
            BiometricInformation.create('external', 20, 'diverse'),
            {
                awareness: 'awareness',
                bodyCheck: 'body',
                breathing: 'breathing',
                hearing: 'hearing',
                injuries: 'injuries',
                isWalkable: true,
                pain: 'pain',
                psyche: 'psyche',
                pulse: 'pulse',
                pupils: 'pupils',
                skin: 'skin',
            },
            PatientStatusCode.create('XAXAXA'),
            'green',
            'green',
            {
                '4e7a6e22-db15-4786-bf27-87e86a2ae7a4': {
                    ...PatientHealthState.create(
                        FunctionParameters.create(0, 0, 0, 0),
                        []
                    ),
                    id: '4e7a6e22-db15-4786-bf27-87e86a2ae7a4',
                },
            },
            '4e7a6e22-db15-4786-bf27-87e86a2ae7a4',
            ImageProperties.create('/assets/male-patient.svg', 80, 1),
            healthPointsDefaults.greenAverage
        )
    );

    const greenNonWalkablePatient = cloneDeepMutable(greenWalkablePatient);
    greenNonWalkablePatient.pretriageInformation.isWalkable = false;

    const yellowWalkablePatient = cloneDeepMutable(greenWalkablePatient);
    yellowWalkablePatient.health = healthPointsDefaults.yellowAverage;
    yellowWalkablePatient.pretriageStatus = 'yellow';
    yellowWalkablePatient.realStatus = 'yellow';

    const yellowNonWalkablePatient = cloneDeepMutable(yellowWalkablePatient);
    yellowNonWalkablePatient.pretriageInformation.isWalkable = false;

    const redWalkablePatient = cloneDeepMutable(greenWalkablePatient);
    redWalkablePatient.health = healthPointsDefaults.redAverage;
    redWalkablePatient.pretriageStatus = 'red';
    redWalkablePatient.realStatus = 'red';

    const redNonWalkablePatient = cloneDeepMutable(redWalkablePatient);
    redNonWalkablePatient.pretriageInformation.isWalkable = false;

    return {
        green: {
            nonWalkable: greenNonWalkablePatient,
            walkable: greenWalkablePatient,
        },
        yellow: {
            nonWalkable: yellowNonWalkablePatient,
            walkable: yellowWalkablePatient,
        },
        red: {
            nonWalkable: redNonWalkablePatient,
            walkable: redWalkablePatient,
        },
    };
}

function errorArgumentFormat(message?: string): never {
    if (message) {
        console.error(message);
    }
    console.error(
        `Usage: ${commandLineArgs[0]} ${commandLineArgs[1]} <number of viewports> <number of gw patients per viewport> <number of gn patients per viewport> <number of yw patients per viewport> <number of yn patients per viewport> <number of rw patients per viewport> <number of rn patients per viewport> <number of RTW per viewport> <number of NEF per viewport> <number of GW-San per viewport>`
    );
    process.exit(1);
}

// Arguments: node <file> <number of viewports> <number of gw patients per viewport> <number of gn patients per viewport> <number of yw patients per viewport> <number of yn patients per viewport> <number of rw patients per viewport> <number of rn patients per viewport> <number of RTW per viewport> <number of NEF per viewport> <number of GW-San per viewport>
const commandLineArgs = process.argv;
if (commandLineArgs.length !== 12) {
    errorArgumentFormat('Invalid argument count');
}
const setup: {
    viewportCount: number;
    gwPatientsPerViewport: number;
    gnPatientsPerViewport: number;
    ywPatientsPerViewport: number;
    ynPatientsPerViewport: number;
    rwPatientsPerViewport: number;
    rnPatientsPerViewport: number;
    rtwPerViewport: number;
    nefPerViewport: number;
    gwSanPerViewport: number;
} = {
    viewportCount: Number.parseInt(commandLineArgs[2]),
    gwPatientsPerViewport: Number.parseInt(commandLineArgs[3]),
    gnPatientsPerViewport: Number.parseInt(commandLineArgs[4]),
    ywPatientsPerViewport: Number.parseInt(commandLineArgs[5]),
    ynPatientsPerViewport: Number.parseInt(commandLineArgs[6]),
    rwPatientsPerViewport: Number.parseInt(commandLineArgs[7]),
    rnPatientsPerViewport: Number.parseInt(commandLineArgs[8]),
    rtwPerViewport: Number.parseInt(commandLineArgs[9]),
    nefPerViewport: Number.parseInt(commandLineArgs[10]),
    gwSanPerViewport: Number.parseInt(commandLineArgs[11]),
};

if (
    Number.isNaN(setup.viewportCount) ||
    Number.isNaN(setup.gwPatientsPerViewport) ||
    Number.isNaN(setup.gnPatientsPerViewport) ||
    Number.isNaN(setup.ywPatientsPerViewport) ||
    Number.isNaN(setup.ynPatientsPerViewport) ||
    Number.isNaN(setup.rwPatientsPerViewport) ||
    Number.isNaN(setup.rnPatientsPerViewport) ||
    Number.isNaN(setup.rtwPerViewport) ||
    Number.isNaN(setup.nefPerViewport) ||
    Number.isNaN(setup.gwSanPerViewport)
) {
    errorArgumentFormat('Non-integer input');
}
if (
    setup.viewportCount < 0 ||
    setup.gwPatientsPerViewport < 0 ||
    setup.gnPatientsPerViewport < 0 ||
    setup.ywPatientsPerViewport < 0 ||
    setup.ynPatientsPerViewport < 0 ||
    setup.rwPatientsPerViewport < 0 ||
    setup.rnPatientsPerViewport < 0 ||
    setup.rtwPerViewport < 0 ||
    setup.nefPerViewport < 0 ||
    setup.gwSanPerViewport < 0
) {
    errorArgumentFormat('Negative input');
}

// Never use a database here.
process.env.USE_DB = 'false';
Config.initialize();

const dataSource = createNewDataSource();

const databaseService = new DatabaseService(dataSource);

const exerciseIds: ExerciseIds = {
    participantId: UserReadableIdGenerator.generateId(6),
    trainerId: UserReadableIdGenerator.generateId(8),
};

const exercise = ExerciseWrapper.create(
    exerciseIds.participantId,
    exerciseIds.trainerId,
    databaseService
);

const patients = getPatients();

repeat(setup.viewportCount, (i) => {
    const viewportPosition = Position.create(i * 200, 0);
    exercise.applyAction(
        {
            type: '[Viewport] Add viewport',
            viewport: Viewport.create(
                viewportPosition,
                Size.create(195, 100),
                `PA ${i}`,
                AutomatedViewportConfig.create('none', true)
            ),
        },
        null
    );
    repeat(setup.gwPatientsPerViewport, () => {
        exercise.applyAction(
            {
                type: '[Patient] Add patient',
                patient: {
                    ...patients.green.walkable,
                    id: uuid(),
                    position: viewportPosition,
                },
            },
            null
        );
    });
    repeat(setup.gnPatientsPerViewport, () => {
        exercise.applyAction(
            {
                type: '[Patient] Add patient',
                patient: {
                    ...patients.green.nonWalkable,
                    id: uuid(),
                    position: viewportPosition,
                },
            },
            null
        );
    });
    repeat(setup.ywPatientsPerViewport, () => {
        exercise.applyAction(
            {
                type: '[Patient] Add patient',
                patient: {
                    ...patients.yellow.walkable,
                    id: uuid(),
                    position: viewportPosition,
                },
            },
            null
        );
    });
    repeat(setup.ynPatientsPerViewport, () => {
        exercise.applyAction(
            {
                type: '[Patient] Add patient',
                patient: {
                    ...patients.yellow.nonWalkable,
                    id: uuid(),
                    position: viewportPosition,
                },
            },
            null
        );
    });
    repeat(setup.rwPatientsPerViewport, () => {
        exercise.applyAction(
            {
                type: '[Patient] Add patient',
                patient: {
                    ...patients.red.walkable,
                    id: uuid(),
                    position: viewportPosition,
                },
            },
            null
        );
    });
    repeat(setup.rnPatientsPerViewport, () => {
        exercise.applyAction(
            {
                type: '[Patient] Add patient',
                patient: {
                    ...patients.red.nonWalkable,
                    id: uuid(),
                    position: viewportPosition,
                },
            },
            null
        );
    });

    repeat(setup.rtwPerViewport, () => {
        const rtwParams = createVehicleParameters(
            exercise
                .getStateSnapshot()
                .vehicleTemplates.find(
                    (template) => template.vehicleType === 'RTW'
                )!,
            viewportPosition
        );
        exercise.applyAction(
            {
                type: '[Vehicle] Add vehicle',
                materials: rtwParams.materials,
                personnel: rtwParams.personnel,
                vehicle: rtwParams.vehicle,
            },
            null
        );
    });

    repeat(setup.nefPerViewport, () => {
        const nefParams = createVehicleParameters(
            exercise
                .getStateSnapshot()
                .vehicleTemplates.find(
                    (template) => template.vehicleType === 'NEF'
                )!,
            viewportPosition
        );
        exercise.applyAction(
            {
                type: '[Vehicle] Add vehicle',
                materials: nefParams.materials,
                personnel: nefParams.personnel,
                vehicle: nefParams.vehicle,
            },
            null
        );
    });

    repeat(setup.gwSanPerViewport, () => {
        const gwSanParams = createVehicleParameters(
            exercise
                .getStateSnapshot()
                .vehicleTemplates.find(
                    (template) => template.vehicleType === 'GW-San'
                )!,
            viewportPosition
        );
        exercise.applyAction(
            {
                type: '[Vehicle] Add vehicle',
                materials: gwSanParams.materials,
                personnel: gwSanParams.personnel,
                vehicle: gwSanParams.vehicle,
            },
            null
        );
    });
});

console.log(JSON.stringify(new StateExport(exercise.getStateSnapshot())));
