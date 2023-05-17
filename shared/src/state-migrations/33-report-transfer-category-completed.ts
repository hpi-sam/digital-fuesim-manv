import type { Migration } from './migration-functions';

interface SimulatedRegionStub {
    behaviors: BehaviorStateStub[];
}

interface ReportBehaviorStub {
    type: 'reportBehavior';
    reportTransferOfCategoryInSingleRegionCompleted: boolean;
    reportTransferOfCategoryInMultipleRegionsCompleted: boolean;
}

type BehaviorStateStub =
    | ReportBehaviorStub
    | {
          type: Exclude<'reportBehavior', unknown>;
      };

export const reportTransferCategoryCompleted33: Migration = {
    action: (_intermediaryState, action) => {
        if (
            (action as { type: string }).type ===
            '[SimulatedRegion] Add Behavior'
        ) {
            const typedAction = action as {
                behaviorState: BehaviorStateStub;
            };
            if (typedAction.behaviorState.type === 'reportBehavior') {
                migrateReportBehavior(typedAction.behaviorState);
            }
        } else if (
            (action as { type: string }).type ===
            '[SimulatedRegion] Add simulated region'
        ) {
            const typedAction = action as {
                simulatedRegion: SimulatedRegionStub;
            };
            migrateSimulatedRegion(typedAction.simulatedRegion);
        }
        return true;
    },
    state: (state) => {
        const typedState = state as {
            simulatedRegions: {
                [key: string]: SimulatedRegionStub;
            };
        };

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                migrateSimulatedRegion(simulatedRegion);
            }
        );
    },
};

function migrateSimulatedRegion(simulatedRegion: SimulatedRegionStub) {
    simulatedRegion.behaviors.forEach((behavior) => {
        {
            if (behavior.type === 'reportBehavior') {
                migrateReportBehavior(behavior);
            }
        }
    });
}

function migrateReportBehavior(behavior: ReportBehaviorStub) {
    behavior.reportTransferOfCategoryInSingleRegionCompleted = false;
    behavior.reportTransferOfCategoryInMultipleRegionsCompleted = false;
}
