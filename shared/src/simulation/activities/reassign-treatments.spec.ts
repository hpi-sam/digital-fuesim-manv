import produce from 'immer';
import { jest } from '@jest/globals';
import { SimulatedRegion } from '../../models';
import { MapCoordinates, Size } from '../../models/utils';
import { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
import { cloneDeepMutable, uuid } from '../../utils';
import { AssignLeaderBehaviorState } from '../behaviors/assign-leader';
import {
    reassignTreatmentsActivity,
    ReassignTreatmentsActivityState,
} from './reassign-treatments';

const emptyState = ExerciseState.create('123456');

/**
 * TODO: Update comment
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
    const terminate = jest.fn();

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
    };
}

describe('calculate treatment', () => {
    it('does nothing when there is nothing', () => {
        const { beforeState, newState, terminate } =
            setupStateAndApplyTreatments(
                ReassignTreatmentsActivityState.create(uuid(), 'unknown', 0)
            );
        expect(newState).toStrictEqual(beforeState);
        expect(terminate).toBeCalled();
    });
});
