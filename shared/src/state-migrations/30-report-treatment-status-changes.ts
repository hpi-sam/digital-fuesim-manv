import type { Migration } from './migration-functions';

interface SimulatedRegionStub {
    behaviors: BehaviorStateStub[];
}

interface ReportBehaviorStub {
    type: 'reportBehavior';
    reportTreatmentProgressChanges: boolean;
}

type BehaviorStateStub =
    | ReportBehaviorStub
    | {
          type: Exclude<'answerRequestsBehavior', unknown>;
      };

type RadiogramStub =
    | { type: 'treatmentStatusRadiogram'; treatmentStatusChanged: boolean }
    | { type: Exclude<'treatmentStatusRadiogram', unknown> };

export const reportTreatmentStatusChanges30: Migration = {
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
            radiograms: { [key: string]: RadiogramStub };
        };

        Object.values(typedState.simulatedRegions).forEach(
            (simulatedRegion) => {
                migrateSimulatedRegion(simulatedRegion);
            }
        );

        Object.values(typedState.radiograms).forEach((radiogram) => {
            if (radiogram.type === 'treatmentStatusRadiogram') {
                radiogram.treatmentStatusChanged = false;
            }
        });
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
    behavior.reportTreatmentProgressChanges = false;
}
