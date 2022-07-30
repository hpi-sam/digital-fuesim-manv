import { PatientHealthState, PatientTemplate } from '../../models';
import { PatientCategory } from '../../models/patient-category';
import type { ImageProperties } from '../../models/utils';
import {
    Breathing,
    Circulation,
    Disability,
    Exposure,
} from '../../models/utils';

const defaultMaleImage: ImageProperties = {
    url: '/assets/male-patient.svg',
    height: 80,
    aspectRatio: 1,
};

export const defaultPatientCategories: readonly PatientCategory[] = [
    PatientCategory.create('ZCVEVE', defaultMaleImage, [
        PatientTemplate.create(
            {
                sex: 'female',
                externalFeatures: '1,64 m, blaue Augen, blond',
                age: 55,
            },
            {
                noChangesState: PatientHealthState.create(
                    'noChangesState',
                    {
                        injuries: 'Diese Informationen können sich ändern',
                        bodyCheck:
                            'Prellmarken und Wunde linke Flanke; Rippenserienfraktur links',
                        isWalkable: false,
                        xCriticalBleeding:
                            'spritzende Blutung deutlicher Blutverlust',
                        aAirway: 'frei',
                        bBreathing: Breathing.create('Tachypnoe', '30', ''),
                        cCirculation: Circulation.create(
                            '145',
                            'rhytmisch',
                            'zentral',
                            '> 2 sec'
                        ),
                        dDisability: Disability.create(
                            'isocor',
                            '10',
                            '3',
                            '2',
                            '5',
                            'teilnahmslos'
                        ),
                        eExposure: Exposure.create('6', 'kaltschweißig'),
                    },
                    'black',
                    []
                ),
                redInstantTransportState: PatientHealthState.create(
                    'redInstantTransportState',
                    {
                        injuries:
                            'starke Schmerzen im gesamten Abdomen mit gespannter Bauchdecke',
                        bodyCheck:
                            'Prellmarken und Wunde linke Flanke; Rippenserienfraktur links',
                        isWalkable: false,
                        xCriticalBleeding:
                            'spritzende Blutung deutlicher Blutverlust',
                        aAirway: 'frei',
                        bBreathing: Breathing.create('Tachypnoe', '30', ''),
                        cCirculation: Circulation.create(
                            '145',
                            'rhytmisch',
                            'zentral',
                            '> 2 sec'
                        ),
                        dDisability: Disability.create(
                            'isocor',
                            '10',
                            '3',
                            '2',
                            '5',
                            'teilnahmslos'
                        ),
                        eExposure: Exposure.create('6', 'kaltschweißig'),
                    },
                    'red',
                    [
                        {
                            earliestTime: 20 * 1000,
                            matchingHealthStateName: 'noChangesState',
                        },
                    ]
                ),
            },
            defaultMaleImage,
            'redInstantTransportState'
        ),
    ]),
];
