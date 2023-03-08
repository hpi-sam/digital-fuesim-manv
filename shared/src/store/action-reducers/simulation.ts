import { IsNumber, IsUUID, Min } from 'class-validator';
import type { TreatPatientsBehaviorState } from '../../simulation';
import type { Mutable } from '../../utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement } from './utils';

export class UpdateTreatPatientsIntervalsAction implements Action {
    @IsValue('[Simulation] Update TreatPatientsIntervals' as const)
    public readonly type = '[Simulation] Update TreatPatientsIntervals';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorStateId!: UUID;

    @IsNumber()
    @Min(-1)
    public readonly unknown!: number;

    @IsNumber()
    @Min(-1)
    public readonly counted!: number;

    @IsNumber()
    @Min(-1)
    public readonly triaged!: number;

    @IsNumber()
    @Min(-1)
    public readonly secured!: number;

    @IsNumber()
    @Min(-1)
    public readonly countingTimePerPatient!: number;
}

export namespace SimulationActionReducers {
    export const updateTreatPatientsIntervals: ActionReducer<UpdateTreatPatientsIntervalsAction> =
        {
            action: UpdateTreatPatientsIntervalsAction,
            /*
             *   unknown, counted, triaged, secured, countingTimePerPatient stay the same when -1
             */
            reducer: (
                draftState,
                {
                    simulatedRegionId,
                    behaviorStateId,
                    unknown,
                    counted,
                    triaged,
                    secured,
                    countingTimePerPatient,
                }
            ) => {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const behaviorStates = simulatedRegion.behaviors;
                const treatPatientsBehaviorState = behaviorStates.find(
                    (behaviorState) => behaviorState.id === behaviorStateId
                ) as Mutable<TreatPatientsBehaviorState>;
                if (unknown >= 0) {
                    treatPatientsBehaviorState.intervals.unknown = unknown;
                }
                if (counted >= 0) {
                    treatPatientsBehaviorState.intervals.counted = counted;
                }
                if (triaged >= 0) {
                    treatPatientsBehaviorState.intervals.triaged = triaged;
                }
                if (secured >= 0) {
                    treatPatientsBehaviorState.intervals.secured = secured;
                }
                if (countingTimePerPatient >= 0) {
                    treatPatientsBehaviorState.intervals.countingTimePerPatient =
                        countingTimePerPatient;
                }
                return draftState;
            },
            rights: 'trainer',
        };
}
