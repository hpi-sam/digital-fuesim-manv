import { IsUUID } from 'class-validator';
import type { ResourceRequestRadiogram } from '../../models/radiogram';
import {
    acceptRadiogram,
    markRadiogramDone,
} from '../../models/radiogram/radiogram-helpers-mutable';
import { VehicleResource } from '../../models/utils/rescue-resource';
import { VehiclesSentEvent } from '../../simulation';
import { sendSimulationEvent } from '../../simulation/events/utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { getElement, getRadiogramById } from './utils';

export class AcceptRadiogramAction implements Action {
    @IsValue('[Radiogram] Accept radiogram' as const)
    public readonly type = '[Radiogram] Accept radiogram';

    @IsUUID(4, uuidValidationOptions)
    public readonly radiogramId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
}

export class MarkDoneRadiogramAction implements Action {
    @IsValue('[Radiogram] Mark as done' as const)
    public readonly type = '[Radiogram] Mark as done';

    @IsUUID(4, uuidValidationOptions)
    public readonly radiogramId!: UUID;

    // Migration would be borderline impossible so we save it now, even if we do not need it yet
    @IsUUID(4, uuidValidationOptions)
    public readonly clientId!: UUID;
}

export class AcceptResourceRequestRadiogramAction implements Action {
    @IsValue('[Radiogram] Accept resource request' as const)
    public readonly type = '[Radiogram] Accept resource request';

    @IsUUID(4, uuidValidationOptions)
    public readonly radiogramId!: UUID;
}

export class DenyResourceRequestRadiogramAction implements Action {
    @IsValue('[Radiogram] Deny resource request' as const)
    public readonly type = '[Radiogram] Deny resource request';

    @IsUUID(4, uuidValidationOptions)
    public readonly radiogramId!: UUID;
}

export namespace RadiogramActionReducers {
    export const acceptRadiogramReducer: ActionReducer<AcceptRadiogramAction> =
        {
            action: AcceptRadiogramAction,
            reducer: (draftState, { radiogramId, clientId }) => {
                acceptRadiogram(draftState, radiogramId, clientId);
                return draftState;
            },
            rights: 'participant',
        };

    export const markDoneReducer: ActionReducer<MarkDoneRadiogramAction> = {
        action: MarkDoneRadiogramAction,
        reducer: (draftState, { radiogramId }) => {
            const radiogram = draftState.radiograms[radiogramId];
            if (radiogram?.type === 'resourceRequestRadiogram') {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    radiogram.simulatedRegionId
                );
                sendSimulationEvent(
                    simulatedRegion,
                    cloneDeepMutable(
                        VehiclesSentEvent.create(VehicleResource.create({}))
                    )
                );
            }

            markRadiogramDone(draftState, radiogramId);

            return draftState;
        },
        rights: 'participant',
    };

    export const acceptResourceRequestRadiogramReducer: ActionReducer<AcceptResourceRequestRadiogramAction> =
        {
            action: AcceptResourceRequestRadiogramAction,
            reducer: (draftState, { radiogramId }) => {
                const radiogram = getRadiogramById<ResourceRequestRadiogram>(
                    draftState,
                    radiogramId,
                    'resourceRequestRadiogram'
                );
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    radiogram.simulatedRegionId
                );

                sendSimulationEvent(
                    simulatedRegion,
                    cloneDeepMutable(
                        VehiclesSentEvent.create(radiogram.requiredResource)
                    )
                );

                markRadiogramDone(draftState, radiogramId);

                return draftState;
            },
            rights: 'participant',
        };

    export const denyResourceRequestRadiogramReducer: ActionReducer<DenyResourceRequestRadiogramAction> =
        {
            action: DenyResourceRequestRadiogramAction,
            reducer: (draftState, { radiogramId }) => {
                const radiogram = getRadiogramById<ResourceRequestRadiogram>(
                    draftState,
                    radiogramId,
                    'resourceRequestRadiogram'
                );
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    radiogram.simulatedRegionId
                );

                sendSimulationEvent(
                    simulatedRegion,
                    cloneDeepMutable(
                        VehiclesSentEvent.create(VehicleResource.create({}))
                    )
                );

                markRadiogramDone(draftState, radiogramId);

                return draftState;
            },
            rights: 'participant',
        };
}
