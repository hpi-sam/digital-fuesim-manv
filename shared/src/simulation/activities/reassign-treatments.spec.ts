import produce from 'immer';
import { Personnel, SimulatedRegion, TransferPoint } from '../../models';
import type { PatientStatus, PersonnelType } from '../../models/utils';
import {
    CanCaterFor,
    MapCoordinates,
    SimulatedRegionPosition,
    Size,
} from '../../models/utils';
import { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
import { cloneDeepMutable, uuid } from '../../utils';
import { AssignLeaderBehaviorState } from '../behaviors/assign-leader';
import { addPatient } from '../../../tests/utils/patients.spec';
import { addPersonnel } from '../../../tests/utils/personnel.spec';
import { defaultPersonnelTemplates } from '../../data/default-state/personnel-templates';
import { TreatmentProgressChangedEvent } from '../events';
import { assertCatering } from '../../../tests/utils/catering.spec';
import { addMaterial } from '../../../tests/utils/materials.spec';
import { sendSimulationEvent } from '../events/utils';
import {
    reassignTreatmentsActivity,
    ReassignTreatmentsActivityState,
} from './reassign-treatments';

const emptyState = ExerciseState.create('123456');

/**
 * TODO: Update comment and rename function
 * Perform {@link mutateBeforeState} and then call `calculateTreatments`
 * @param mutateBeforeState A function that may be called on the default state before calling to `calculateTreatments`.
 * @returns The state before and after calling `calculateTreatments`
 */
function setupStateAndApplyTreatments(
    activityState: ReassignTreatmentsActivityState,
    leaderId?: UUID,
    mutateBeforeState?: (
        state: Mutable<ExerciseState>,
        simulatedRegion: SimulatedRegion
    ) => void
) {
    const simulatedRegion = SimulatedRegion.create(
        MapCoordinates.create(0, 0),
        Size.create(10, 10),
        'test region'
    );
    const transferPoint = TransferPoint.create(
        SimulatedRegionPosition.create(simulatedRegion.id),
        {},
        {},
        '',
        `[Simuliert] test region`
    );
    const leaderBehaviorState = AssignLeaderBehaviorState.create();
    const beforeState = produce(emptyState, (draftState) => {
        draftState.simulatedRegions[simulatedRegion.id] =
            cloneDeepMutable(simulatedRegion);
        draftState.simulatedRegions[simulatedRegion.id]?.behaviors.push(
            cloneDeepMutable(leaderBehaviorState)
        );
        draftState.transferPoints[transferPoint.id] =
            cloneDeepMutable(transferPoint);

        if (leaderId) {
            (
                draftState.simulatedRegions[simulatedRegion.id]
                    ?.behaviors[0] as Mutable<AssignLeaderBehaviorState>
            ).leaderId = leaderId;
        }

        mutateBeforeState?.(draftState, simulatedRegion);
    });

    const newActivityState = cloneDeepMutable(activityState);
    // Unfortunately, the global jest object is not found (even though `@types/jest` is installed)
    // and importing jest from `@jest/globals` causes issues...
    const terminate = import.meta.jest.fn();

    const newState = produce(beforeState, (draftState) => {
        reassignTreatmentsActivity.tick(
            draftState,
            draftState.simulatedRegions[simulatedRegion.id]!,
            newActivityState,
            1000,
            terminate
        );
    });
    return {
        beforeState,
        newState,
        newActivityState,
        terminate,
        simulatedRegion: newState.simulatedRegions[simulatedRegion.id],
    };
}

describe('reassign treatment', () => {
    describe.each(['unknown', 'counted', 'triaged', 'secured'] as const)(
        'in %s state',
        (state) => {
            it('goes to noTreatment when there is nothing', () => {
                const { beforeState, newState, simulatedRegion, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(uuid(), state, 0)
                    );
                const shouldState = produce(beforeState, (draftState) => {
                    sendSimulationEvent(
                        draftState.simulatedRegions[simulatedRegion!.id]!,
                        TreatmentProgressChangedEvent.create('noTreatment')
                    );
                });
                expect(newState).toStrictEqual(shouldState);
                expect(terminate).toBeCalled();
            });

            it('goes to noTreatment when there is no personnel', () => {
                const { beforeState, newState, simulatedRegion, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            state,
                            0
                        ),
                        undefined,
                        (draftState, { id }) => {
                            addPatient(
                                draftState,
                                'white',
                                'red',
                                SimulatedRegionPosition.create(id)
                            );
                        }
                    );
                const shouldState = produce(beforeState, (draftState) => {
                    sendSimulationEvent(
                        draftState.simulatedRegions[simulatedRegion!.id]!,
                        TreatmentProgressChangedEvent.create('noTreatment')
                    );
                });
                expect(newState).toStrictEqual(shouldState);
                expect(terminate).toBeCalled();
            });

            it('goes to noTreatment when there is no leading personnel', () => {
                const { beforeState, newState, simulatedRegion, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            state,
                            0
                        ),
                        undefined,
                        (draftState, { id }) => {
                            addPatient(
                                draftState,
                                'white',
                                'red',
                                SimulatedRegionPosition.create(id)
                            );

                            addPersonnel(
                                draftState,
                                Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(id)
                                )
                            );
                        }
                    );
                const shouldState = produce(beforeState, (draftState) => {
                    sendSimulationEvent(
                        draftState.simulatedRegions[simulatedRegion!.id]!,
                        TreatmentProgressChangedEvent.create('noTreatment')
                    );
                });
                expect(newState).toStrictEqual(shouldState);
                expect(terminate).toBeCalled();
            });

            it('does nothing when there is only the leading personnel', () => {
                const leaderId = uuid();

                const { beforeState, newState, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            state,
                            0
                        ),
                        leaderId,
                        (draftState, simulatedRegion) => {
                            addPatient(
                                draftState,
                                'white',
                                'red',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            );

                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        simulatedRegion.id
                                    )
                                ),
                                id: leaderId,
                            });
                        }
                    );
                expect(newState).toStrictEqual(beforeState);
                expect(terminate).toBeCalled();
            });
        }
    );

    describe.each(['counted', 'triaged', 'secured'] as const)(
        'in %s state',
        (state) => {
            it('ignores black (dead) patients', () => {
                const leaderId = uuid();
                let catererId: UUID = '';

                const { beforeState, newState } = setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(uuid(), state, 0),
                    leaderId,
                    (draftState, simulatedRegion) => {
                        addPatient(
                            draftState,
                            'black',
                            'black',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );
                        addPatient(
                            draftState,
                            'black',
                            'black',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );
                        addPatient(
                            draftState,
                            'black',
                            'black',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        catererId = addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            )
                        ).id;
                    }
                );

                assertCatering(beforeState, newState, [
                    { catererId, catererType: 'personnel', patientIds: [] },
                ]);
            });
        }
    );

    describe('in unknown state', () => {
        it('starts counting when there is personnel', () => {
            const leaderId = uuid();
            const time = 123;

            const { beforeState, newState, terminate, newActivityState } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(
                        uuid(),
                        'unknown',
                        0
                    ),
                    leaderId,
                    (draftState, simulatedRegion) => {
                        addPatient(
                            draftState,
                            'white',
                            'red',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            )
                        );

                        draftState.currentTime = time;
                    }
                );
            expect(newState).toStrictEqual(beforeState);
            expect(terminate).not.toBeCalled();
            expect(newActivityState.countingStartedAt).toBe(time);
        });

        it('continues counting if the time is not up', () => {
            const leaderId = uuid();
            const startTime = 1000 * 60 * 5;
            const countingTime = 1000 * 20;

            const activityState = cloneDeepMutable(
                ReassignTreatmentsActivityState.create(
                    uuid(),
                    'unknown',
                    countingTime
                )
            );
            activityState.countingStartedAt = startTime;

            const { beforeState, newState, terminate, newActivityState } =
                setupStateAndApplyTreatments(
                    activityState,
                    leaderId,
                    (draftState, simulatedRegion) => {
                        addPatient(
                            draftState,
                            'white',
                            'red',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            )
                        );

                        draftState.currentTime =
                            startTime + Math.floor(countingTime / 2);
                    }
                );
            expect(newState).toStrictEqual(beforeState);
            expect(terminate).not.toBeCalled();
            expect(newActivityState.countingStartedAt).toBe(startTime);
        });

        it('finishes counting and sends event if the time not up', () => {
            const leaderId = uuid();
            const startTime = 1000 * 60 * 5;
            const countingTime = 1000 * 20;

            const activityState = cloneDeepMutable(
                ReassignTreatmentsActivityState.create(
                    uuid(),
                    'unknown',
                    countingTime
                )
            );
            activityState.countingStartedAt = startTime;

            const { terminate, newActivityState, simulatedRegion } =
                setupStateAndApplyTreatments(
                    activityState,
                    leaderId,
                    (draftState, _simulatedRegion) => {
                        addPatient(
                            draftState,
                            'white',
                            'red',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        );

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            )
                        );

                        draftState.currentTime = startTime + countingTime * 2;
                    }
                );

            expect(terminate).toBeCalled();
            expect(newActivityState.countingStartedAt).toBe(startTime);

            const event = simulatedRegion?.inEvents.find(
                (element) => element.type === 'treatmentProgressChangedEvent'
            ) as TreatmentProgressChangedEvent | undefined;

            expect(event).toBeDefined();
            expect(event?.newProgress).toBe('counted');
        });
    });

    describe('in counted state', () => {
        it('assigns personnel to white patients for triage', () => {
            const leaderId = uuid();
            let patientId: UUID = '';
            let catererId: UUID = '';

            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(
                        uuid(),
                        'counted',
                        0
                    ),
                    leaderId,
                    (draftState, simulatedRegion) => {
                        patientId = addPatient(
                            draftState,
                            'white',
                            'red',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        ).id;

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        catererId = addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            )
                        ).id;
                    }
                );

            expect(terminate).toBeCalled();

            assertCatering(beforeState, newState, [
                {
                    catererId,
                    catererType: 'personnel',
                    patientIds: [patientId],
                },
            ]);
        });

        it('prefers triage over treatment', () => {
            const leaderId = uuid();
            let whitePatientId: UUID = '';
            let catererId: UUID = '';

            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(
                        uuid(),
                        'counted',
                        0
                    ),
                    leaderId,
                    (draftState, simulatedRegion) => {
                        addPatient(
                            draftState,
                            'red',
                            'red',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );
                        whitePatientId = addPatient(
                            draftState,
                            'white',
                            'red',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        ).id;
                        addPatient(
                            draftState,
                            'green',
                            'green',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        catererId = addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            )
                        ).id;
                    }
                );

            expect(terminate).toBeCalled();

            assertCatering(beforeState, newState, [
                {
                    catererId,
                    catererType: 'personnel',
                    patientIds: [whitePatientId],
                },
            ]);
        });

        it('does not send an events if not all patients are triaged', () => {
            const leaderId = uuid();

            const { terminate, simulatedRegion } = setupStateAndApplyTreatments(
                ReassignTreatmentsActivityState.create(uuid(), 'counted', 0),
                leaderId,
                (draftState, _simulatedRegion) => {
                    addPatient(
                        draftState,
                        'white',
                        'red',
                        SimulatedRegionPosition.create(_simulatedRegion.id)
                    );

                    addPersonnel(draftState, {
                        ...Personnel.generatePersonnel(
                            defaultPersonnelTemplates.notSan,
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ),
                        id: leaderId,
                    });
                }
            );

            expect(simulatedRegion?.inEvents).toBeEmpty();
            expect(terminate).toBeCalled();
        });

        it('sends an event when all patients are triaged', () => {
            const leaderId = uuid();

            const { terminate, simulatedRegion } = setupStateAndApplyTreatments(
                ReassignTreatmentsActivityState.create(uuid(), 'counted', 0),
                leaderId,
                (draftState, _simulatedRegion) => {
                    addPatient(
                        draftState,
                        'red',
                        'red',
                        SimulatedRegionPosition.create(_simulatedRegion.id)
                    );
                    addPatient(
                        draftState,
                        'yellow',
                        'yellow',
                        SimulatedRegionPosition.create(_simulatedRegion.id)
                    );
                    addPatient(
                        draftState,
                        'green',
                        'green',
                        SimulatedRegionPosition.create(_simulatedRegion.id)
                    );

                    addPersonnel(draftState, {
                        ...Personnel.generatePersonnel(
                            defaultPersonnelTemplates.notSan,
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ),
                        id: leaderId,
                    });

                    addPersonnel(
                        draftState,
                        Personnel.generatePersonnel(
                            defaultPersonnelTemplates.rettSan,
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        )
                    );
                }
            );

            expect(terminate).toBeCalled();

            const event = simulatedRegion?.inEvents.find(
                (element) => element.type === 'treatmentProgressChangedEvent'
            ) as TreatmentProgressChangedEvent | undefined;

            expect(event).toBeDefined();
            expect(event?.newProgress).toBe('triaged');
        });
    });

    describe.each(['triaged', 'secured'] as const)('in %s state', (state) => {
        it('prefers red over yellow patients', () => {
            const leaderId = uuid();
            const redPatientIds: UUID[] = [];
            let notSanId: UUID = '';
            let rettSanId: UUID = '';

            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(uuid(), state, 0),
                    leaderId,
                    (draftState, _simulatedRegion) => {
                        redPatientIds.push(
                            addPatient(
                                draftState,
                                'red',
                                'red',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ).id
                        );
                        addPatient(
                            draftState,
                            'yellow',
                            'yellow',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        );
                        redPatientIds.push(
                            addPatient(
                                draftState,
                                'red',
                                'red',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ).id
                        );

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        notSanId = addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            )
                        ).id;

                        rettSanId = addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            canCaterFor: CanCaterFor.create(2, 0, 0, 'and'),
                        }).id;
                    }
                );

            expect(terminate).toBeCalled();

            assertCatering(beforeState, newState, [
                {
                    catererId: notSanId,
                    catererType: 'personnel',
                    patientIds: redPatientIds,
                },
                {
                    catererId: rettSanId,
                    catererType: 'personnel',
                    patientIds: redPatientIds,
                },
            ]);
        });

        it('prefers yellow over green patients', () => {
            const leaderId = uuid();
            let yellowPatientId: UUID = '';
            let catererId: UUID = '';

            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(uuid(), state, 0),
                    leaderId,
                    (draftState, _simulatedRegion) => {
                        addPatient(
                            draftState,
                            'green',
                            'green',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        );
                        yellowPatientId = addPatient(
                            draftState,
                            'yellow',
                            'yellow',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ).id;
                        addPatient(
                            draftState,
                            'green',
                            'green',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        );

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        catererId = addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.rettSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            canCaterFor: CanCaterFor.create(0, 1, 0, 'and'),
                        }).id;
                    }
                );

            expect(terminate).toBeCalled();

            assertCatering(beforeState, newState, [
                {
                    catererId,
                    catererType: 'personnel',
                    patientIds: [yellowPatientId],
                },
            ]);
        });

        it.each(['red', 'yellow'] as const)(
            'does not mix green patients with %s patients',
            (higherStatus) => {
                const leaderId = uuid();
                let higherPatientId: UUID = '';
                let catererId: UUID = '';

                const { beforeState, newState, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            state,
                            0
                        ),
                        leaderId,
                        (draftState, _simulatedRegion) => {
                            addPatient(
                                draftState,
                                'green',
                                'green',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            );
                            higherPatientId = addPatient(
                                draftState,
                                higherStatus,
                                higherStatus,
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ).id;
                            addPatient(
                                draftState,
                                'green',
                                'green',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            );

                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                id: leaderId,
                            });

                            catererId = addPersonnel(
                                draftState,
                                Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                )
                            ).id;
                        }
                    );

                expect(terminate).toBeCalled();

                assertCatering(beforeState, newState, [
                    {
                        catererId,
                        catererType: 'personnel',
                        patientIds: [higherPatientId],
                    },
                ]);
            }
        );

        it('does not assign more than two patients on a personnel regardless of their capacity', () => {
            const leaderId = uuid();
            let catererId: UUID = '';

            const { newState, terminate } = setupStateAndApplyTreatments(
                ReassignTreatmentsActivityState.create(uuid(), state, 0),
                leaderId,
                (draftState, _simulatedRegion) => {
                    for (let i = 0; i < 10; i++) {
                        addPatient(
                            draftState,
                            'green',
                            'green',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        );
                    }

                    addPersonnel(draftState, {
                        ...Personnel.generatePersonnel(
                            defaultPersonnelTemplates.notSan,
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ),
                        id: leaderId,
                    });

                    catererId = addPersonnel(draftState, {
                        ...Personnel.generatePersonnel(
                            defaultPersonnelTemplates.san,
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ),
                        canCaterFor: CanCaterFor.create(0, 0, 10, 'and'),
                    }).id;
                }
            );

            expect(terminate).toBeCalled();
            expect(
                Object.keys(
                    // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
                    newState.personnel[catererId]?.assignedPatientIds ?? {}
                )
            ).toBeArrayOfSize(2);
        });

        it('respects the treatment capacity of personnel', () => {
            const leaderId = uuid();
            let catererId: UUID = '';

            const { newState, terminate } = setupStateAndApplyTreatments(
                ReassignTreatmentsActivityState.create(uuid(), state, 0),
                leaderId,
                (draftState, _simulatedRegion) => {
                    for (let i = 0; i < 10; i++) {
                        addPatient(
                            draftState,
                            'green',
                            'green',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        );
                    }

                    addPersonnel(draftState, {
                        ...Personnel.generatePersonnel(
                            defaultPersonnelTemplates.notSan,
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ),
                        id: leaderId,
                    });

                    catererId = addPersonnel(draftState, {
                        ...Personnel.generatePersonnel(
                            defaultPersonnelTemplates.san,
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ),
                        canCaterFor: CanCaterFor.create(0, 0, 1, 'and'),
                    }).id;
                }
            );

            expect(terminate).toBeCalled();
            expect(
                Object.keys(
                    // eslint-disable-next-line total-functions/no-unsafe-readonly-mutable-assignment
                    newState.personnel[catererId]?.assignedPatientIds ?? {}
                )
            ).toBeArrayOfSize(1);
        });

        it.each(['red', 'yellow', 'green'] as const)(
            "does not assign personnel to %s patients that can't treat such patients even if the personnel type would allow it",
            (status) => {
                const leaderId = uuid();

                const { beforeState, newState, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            state,
                            0
                        ),
                        leaderId,
                        (draftState, _simulatedRegion) => {
                            addPatient(
                                draftState,
                                status,
                                status,
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            );

                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                id: leaderId,
                            });

                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                canCaterFor: CanCaterFor.create(0, 0, 0, 'and'),
                            });
                        }
                    );

                expect(terminate).toBeCalled();
                assertCatering(beforeState, newState, []);
            }
        );

        it.each([
            ['notarzt', 'red'],
            ['notSan', 'yellow'],
            ['notarzt', 'yellow'],
            ['rettSan', 'green'],
            ['notSan', 'green'],
            ['notarzt', 'green'],
        ] as const)(
            'switches to "better" personnel for %s patients if the requested personnel type is not available',
            (higherPersonnel, patientStatus) => {
                const leaderId = uuid();
                let patientId: UUID = '';
                let catererId: UUID = '';

                const { beforeState, newState, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            state,
                            0
                        ),
                        leaderId,
                        (draftState, _simulatedRegion) => {
                            patientId = addPatient(
                                draftState,
                                patientStatus,
                                patientStatus,
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ).id;

                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                id: leaderId,
                            });

                            catererId = addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates[higherPersonnel],
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                canCaterFor: CanCaterFor.create(1, 0, 0, 'and'),
                            }).id;
                        }
                    );

                expect(terminate).toBeCalled();
                assertCatering(beforeState, newState, [
                    {
                        catererId,
                        catererType: 'personnel',
                        patientIds: [patientId],
                    },
                ]);
            }
        );

        it('assigns notarzts', () => {
            const leaderId = uuid();
            let patientId: UUID = '';
            let generalCatererId: UUID = '';
            let notarztId: UUID = '';

            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(uuid(), state, 0),
                    leaderId,
                    (draftState, _simulatedRegion) => {
                        patientId = addPatient(
                            draftState,
                            'red',
                            'red',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ).id;

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        generalCatererId = addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            canCaterFor: CanCaterFor.create(1, 0, 0, 'and'),
                        }).id;

                        notarztId = addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notarzt,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            canCaterFor: CanCaterFor.create(1, 0, 0, 'and'),
                        }).id;
                    }
                );

            expect(terminate).toBeCalled();
            assertCatering(beforeState, newState, [
                {
                    catererId: generalCatererId,
                    catererType: 'personnel',
                    patientIds: [patientId],
                },
                {
                    catererId: notarztId,
                    catererType: 'personnel',
                    patientIds: [patientId],
                },
            ]);
        });

        it('assigns material', () => {
            const leaderId = uuid();
            let patientId: UUID = '';
            let catererId: UUID = '';

            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(uuid(), state, 0),
                    leaderId,
                    (draftState, _simulatedRegion) => {
                        patientId = addPatient(
                            draftState,
                            'red',
                            'red',
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ).id;

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            id: leaderId,
                        });

                        addPersonnel(draftState, {
                            ...Personnel.generatePersonnel(
                                defaultPersonnelTemplates.san,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ),
                            canCaterFor: CanCaterFor.create(0, 0, 0, 'and'),
                        });

                        catererId = addMaterial(
                            draftState,
                            SimulatedRegionPosition.create(_simulatedRegion.id)
                        ).id;
                    }
                );

            expect(terminate).toBeCalled();
            assertCatering(beforeState, newState, [
                {
                    catererId,
                    catererType: 'material',
                    patientIds: [patientId],
                },
            ]);
        });

        it.each([
            ['red', 'yellow'],
            ['yellow', 'green'],
            ['red', 'green'],
        ] as const)(
            'prefers %s over %s patients for material assignment',
            (higherStatus, lowerStatus) => {
                const leaderId = uuid();
                let higherPatientId: UUID = '';
                let catererId: UUID = '';

                const { beforeState, newState, terminate } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            state,
                            0
                        ),
                        leaderId,
                        (draftState, _simulatedRegion) => {
                            higherPatientId = addPatient(
                                draftState,
                                higherStatus,
                                higherStatus,
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ).id;
                            addPatient(
                                draftState,
                                lowerStatus,
                                lowerStatus,
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            );

                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                id: leaderId,
                            });

                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.san,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                canCaterFor: CanCaterFor.create(0, 0, 0, 'and'),
                            });

                            catererId = addMaterial(
                                draftState,
                                SimulatedRegionPosition.create(
                                    _simulatedRegion.id
                                )
                            ).id;
                        }
                    );

                expect(terminate).toBeCalled();
                assertCatering(beforeState, newState, [
                    {
                        catererId,
                        catererType: 'material',
                        patientIds: [higherPatientId],
                    },
                ]);
            }
        );
    });

    describe('in triaged state', () => {
        function setupPatientsAndPersonnel(
            draftState: Mutable<ExerciseState>,
            simulatedRegion: SimulatedRegion,
            patients: readonly {
                readonly state: PatientStatus;
                readonly count: number;
            }[],
            personnel: readonly {
                readonly type: PersonnelType;
                readonly count: number;
            }[]
        ) {
            patients.forEach(({ state, count }) => {
                for (let i = 0; i < count; i++) {
                    addPatient(
                        draftState,
                        state,
                        state,
                        SimulatedRegionPosition.create(simulatedRegion.id)
                    );
                }
            });

            personnel.forEach(({ type, count }) => {
                for (let i = 0; i < count; i++) {
                    addPersonnel(
                        draftState,
                        Personnel.generatePersonnel(
                            defaultPersonnelTemplates[type],
                            uuid(),
                            '',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        )
                    );
                }
            });
        }

        it.each([
            {
                // One san is missing
                patients: [{ state: 'green', count: 1 }],
                personnel: [],
            },
            {
                // One notarzt is missing
                patients: [{ state: 'yellow', count: 1 }],
                personnel: [{ type: 'rettSan', count: 1 }],
            },
            {
                // notSan and rettSan are missing
                patients: [{ state: 'red', count: 1 }],
                personnel: [{ type: 'notarzt', count: 1 }],
            },
            {
                // Some bigger scenario with many missing personnel
                patients: [
                    { state: 'red', count: 2 },
                    { state: 'yellow', count: 3 },
                    { state: 'green', count: 5 },
                ],
                personnel: [
                    { type: 'rettSan', count: 3 },
                    { type: 'notarzt', count: 1 },
                ],
            },
        ] as const)(
            'does not send a treatment progress changed event if not all patients are secured (case %#)',
            ({ patients, personnel }) => {
                const leaderId = uuid();

                const { terminate, simulatedRegion } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            'triaged',
                            0
                        ),
                        leaderId,
                        (draftState, _simulatedRegion) => {
                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                id: leaderId,
                            });

                            setupPatientsAndPersonnel(
                                draftState,
                                _simulatedRegion,
                                patients,
                                personnel
                            );
                        }
                    );

                expect(terminate).toBeCalled();
                expect(
                    simulatedRegion?.inEvents.filter(
                        (element) =>
                            element.type === 'treatmentProgressChangedEvent'
                    )
                ).toBeEmpty();
            }
        );

        it.each([
            {
                patients: [{ state: 'green', count: 1 }],
                personnel: [{ type: 'san', count: 1 }],
            },
            {
                patients: [{ state: 'yellow', count: 1 }],
                personnel: [
                    { type: 'rettSan', count: 1 },
                    { type: 'notarzt', count: 1 },
                ],
            },
            {
                patients: [{ state: 'red', count: 1 }],
                personnel: [
                    { type: 'notSan', count: 1 },
                    { type: 'rettSan', count: 1 },
                    { type: 'notarzt', count: 1 },
                ],
            },
            {
                patients: [
                    { state: 'red', count: 2 },
                    { state: 'yellow', count: 3 },
                    { state: 'green', count: 5 },
                ],
                personnel: [
                    { type: 'notSan', count: 2 },
                    { type: 'rettSan', count: 5 },
                    { type: 'san', count: 3 },
                    { type: 'notarzt', count: 2 },
                ],
            },
        ] as const)(
            'sends an event if all patients are secured (case %#)',
            ({ patients, personnel }) => {
                const leaderId = uuid();

                const { terminate, simulatedRegion } =
                    setupStateAndApplyTreatments(
                        ReassignTreatmentsActivityState.create(
                            uuid(),
                            'triaged',
                            0
                        ),
                        leaderId,
                        (draftState, _simulatedRegion) => {
                            addPersonnel(draftState, {
                                ...Personnel.generatePersonnel(
                                    defaultPersonnelTemplates.notSan,
                                    uuid(),
                                    '',
                                    SimulatedRegionPosition.create(
                                        _simulatedRegion.id
                                    )
                                ),
                                id: leaderId,
                            });

                            setupPatientsAndPersonnel(
                                draftState,
                                _simulatedRegion,
                                patients,
                                personnel
                            );
                        }
                    );

                expect(terminate).toBeCalled();

                const event = simulatedRegion?.inEvents.find(
                    (element) =>
                        element.type === 'treatmentProgressChangedEvent'
                ) as TreatmentProgressChangedEvent | undefined;

                expect(event).toBeDefined();
                expect(event?.newProgress).toBe('secured');
            }
        );
    });
});
