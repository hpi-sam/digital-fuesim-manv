import type { Migration } from './migration-functions';

interface BehaviorState {
    type: `${string}Behavior`;
}

interface AssignLeaderBehaviorState extends BehaviorState {
    type: 'assignLeaderBehavior';
    leadershipVehicleTypes?: { [key: string]: true };
}

interface SimulatedRegion {
    behaviors: BehaviorState[];
}

interface Action {
    type: string;
}

interface AddBehaviorAction extends Action {
    type: '[SimulatedRegion] Add Behavior';
    behaviorState: BehaviorState;
}

interface AddSimulatedRegionAction extends Action {
    type: '[SimulatedRegion] Add simulated region';
    simulatedRegion: SimulatedRegion;
}

interface State {
    simulatedRegions: {
        [key: string]: SimulatedRegion;
    };
}

export const addLeadershipVehiclesToAssignLeader35: Migration = {
    action: (_intermediaryState, action) => {
        const typedAction = action as Action;

        if (typedAction.type === '[SimulatedRegion] Add Behavior') {
            const specificlyTypedAction = action as AddBehaviorAction;

            if (
                specificlyTypedAction.behaviorState.type ===
                'assignLeaderBehavior'
            ) {
                migrateBehavior(
                    specificlyTypedAction.behaviorState as AssignLeaderBehaviorState
                );
            }
        }

        if (typedAction.type === '[SimulatedRegion] Add simulated region') {
            const specificlyTypedAction = action as AddSimulatedRegionAction;
            specificlyTypedAction.simulatedRegion.behaviors.forEach(
                (behavior) => {
                    if (behavior.type === 'assignLeaderBehavior') {
                        migrateBehavior(behavior as AssignLeaderBehaviorState);
                    }
                }
            );
        }

        return true;
    },
    state: (state) => {
        const typedState = state as State;

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                simulatedRegion.behaviors.forEach((behavior) => {
                    if (behavior.type === 'assignLeaderBehavior') {
                        migrateBehavior(behavior as AssignLeaderBehaviorState);
                    }
                });
            }
        );
    },
};

function migrateBehavior(behavior: AssignLeaderBehaviorState) {
    const typedBehavior = behavior as {
        type: 'assignLeaderBehavior';
        leadershipVehicleTypes?: { [key: string]: true };
    };

    typedBehavior.leadershipVehicleTypes = {
        'GW-San': true,
    };
}
