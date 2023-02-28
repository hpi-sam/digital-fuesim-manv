import produce from 'immer';
import { Personnel, SimulatedRegion } from '../../models';
import {
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
import {
    reassignTreatmentsActivity,
    ReassignTreatmentsActivityState,
} from './reassign-treatments';
import { TreatmentProgressChangedEvent } from '../events';

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
    const leaderBehaviorState = AssignLeaderBehaviorState.create();
    const beforeState = produce(emptyState, (draftState) => {
        draftState.simulatedRegions[simulatedRegion.id] =
            cloneDeepMutable(simulatedRegion);
        draftState.simulatedRegions[simulatedRegion.id]?.behaviors.push(
            cloneDeepMutable(leaderBehaviorState)
        );

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
    describe('in unknown state', () => {
        it('does nothing when there is nothing', () => {
            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(uuid(), 'unknown', 0)
                );
            expect(newState).toStrictEqual(beforeState);
            expect(terminate).toBeCalled();
        });

        it('does nothing when there is no personnel', () => {
            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(
                        uuid(),
                        'unknown',
                        0
                    ),
                    undefined,
                    (draftState, simulatedRegion) => {
                        addPatient(
                            draftState,
                            'white',
                            'red',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );
                    }
                );
            expect(newState).toStrictEqual(beforeState);
            expect(terminate).toBeCalled();
        });

        it('does nothing when there is no leading personnel', () => {
            const { beforeState, newState, terminate } =
                setupStateAndApplyTreatments(
                    ReassignTreatmentsActivityState.create(
                        uuid(),
                        'unknown',
                        0
                    ),
                    undefined,
                    (draftState, simulatedRegion) => {
                        addPatient(
                            draftState,
                            'white',
                            'red',
                            SimulatedRegionPosition.create(simulatedRegion.id)
                        );

                        addPersonnel(
                            draftState,
                            Personnel.generatePersonnel(
                                defaultPersonnelTemplates.notSan,
                                uuid(),
                                '',
                                SimulatedRegionPosition.create(
                                    simulatedRegion.id
                                )
                            )
                        );
                    }
                );
            expect(newState).toStrictEqual(beforeState);
            expect(terminate).toBeCalled();
        });

        it('does nothing when there is only the leading personnel', () => {
            const leaderId = uuid();

            const { beforeState, newState, terminate } =
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
                    }
                );
            console.log(leaderId);
            console.log(beforeState.personnel);
            expect(newState).toStrictEqual(beforeState);
            expect(terminate).toBeCalled();
        });

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

    // TODO: Add tests for "counted", "triaged" and "secured"
});
