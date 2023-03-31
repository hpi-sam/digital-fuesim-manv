import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import {
    UUID,
    uuid,
    uuidArrayValidationOptions,
    uuidValidationOptions,
} from '../../utils';
import { IsValue } from '../../utils/validators';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class ProvidePersonnelBehaviorState implements SimulationBehaviorState {
    @IsValue('providePersonnelBehavior' as const)
    readonly type = 'providePersonnelBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidArrayValidationOptions)
    public readonly vehicleTemplatePriorities: readonly UUID[];

    /**
     * @deprecated Use {@link create} instead.
     */
    constructor(vehicleTemplatePriorities?: UUID[]) {
        this.vehicleTemplatePriorities = vehicleTemplatePriorities ?? [];
    }

    static readonly create = getCreate(this);
}

export const providePersonnelBehavior: SimulationBehavior<ProvidePersonnelBehaviorState> =
    {
        behaviorState: ProvidePersonnelBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            if (
                event.type === 'resourceRequiredEvent' &&
                event.requiredResource.type === 'personnelResource'
            ) {
                // TODO: create activity to translate event.requiredResource.personnelCounts
            }
        },
    };
